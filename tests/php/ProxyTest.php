<?php

declare(strict_types=1);

namespace Netresearch\AssetPicker\Tests;

use Netresearch\AssetPicker\Proxy;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\Request;

#[CoversClass(Proxy::class)]
final class ProxyTest extends TestCase
{
    public function testForwardsBodyAndContentTypeAndStripsTransferEncoding(): void
    {
        $client = new MockHttpClient(new MockResponse('IMAGE-BYTES', [
            'http_code' => 200,
            'response_headers' => [
                'content-type' => 'image/png',
                'transfer-encoding' => 'chunked',
            ],
        ]));
        $proxy = new Proxy($client);

        $response = $proxy->forward(Request::create('/proxy.php', 'GET'), 'https://example.com/a.png');

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('IMAGE-BYTES', $response->getContent());
        self::assertSame('image/png', $response->headers->get('content-type'));
        self::assertFalse(
            $response->headers->has('transfer-encoding'),
            'hop-by-hop transfer-encoding must not be forwarded',
        );
    }

    public function testRewritesRedirectLocationBackThroughProxy(): void
    {
        $target = 'https://cdn.example.com/final.png';
        $client = new MockHttpClient(new MockResponse('', [
            'http_code' => 302,
            'response_headers' => ['location' => $target],
        ]));
        $proxy = new Proxy($client);

        $response = $proxy->forward(
            Request::create('https://host.test/proxy.php', 'GET'),
            'https://example.com/a.png',
        );

        self::assertTrue($response->isRedirect());
        $location = (string) $response->headers->get('location');
        self::assertStringStartsWith('https://host.test', $location);
        self::assertStringEndsWith('?to=' . urlencode($target), $location);
    }

    /**
     * @return iterable<string, array{string, array<string, string>, string}>
     */
    public static function proxyEntryPoints(): iterable
    {
        yield 'standalone proxy.php' => [
            '/proxy.php?to=x',
            ['SCRIPT_NAME' => '/proxy.php', 'SCRIPT_FILENAME' => '/srv/proxy.php', 'PHP_SELF' => '/proxy.php'],
            'https://host.test/proxy.php',
        ];
        yield 'route behind a rewriting front controller' => [
            '/assetpicker?to=x',
            ['SCRIPT_NAME' => '/index.php', 'SCRIPT_FILENAME' => '/srv/public/index.php', 'PHP_SELF' => '/index.php'],
            'https://host.test/assetpicker',
        ];
        yield 'route with the front controller in the URL' => [
            '/index.php/assetpicker?to=x',
            ['SCRIPT_NAME' => '/index.php', 'SCRIPT_FILENAME' => '/srv/public/index.php', 'PHP_SELF' => '/index.php/assetpicker'],
            'https://host.test/index.php/assetpicker',
        ];
        yield 'route with the front controller in a sub directory' => [
            '/app/index.php/assetpicker?to=x',
            ['SCRIPT_NAME' => '/app/index.php', 'SCRIPT_FILENAME' => '/srv/public/index.php', 'PHP_SELF' => '/app/index.php/assetpicker'],
            'https://host.test/app/index.php/assetpicker',
        ];
    }

    /**
     * @param array<string, string> $server
     */
    #[DataProvider('proxyEntryPoints')]
    public function testRewritesRedirectLocationToTheProxyEntryPoint(string $uri, array $server, string $proxyUrl): void
    {
        $target = 'https://cdn.example.com/final.png';
        $client = new MockHttpClient(new MockResponse('', [
            'http_code' => 302,
            'response_headers' => ['location' => $target],
        ]));
        $proxy = new Proxy($client);

        $response = $proxy->forward(
            Request::create('https://host.test' . $uri, 'GET', server: $server),
            'https://example.com/a.png',
        );

        self::assertSame($proxyUrl . '?to=' . urlencode($target), $response->headers->get('location'));
    }

    /**
     * @return iterable<string, array{string, list<string>}>
     */
    public static function applicationCredentials(): iterable
    {
        yield 'basic authentication' => [
            'Basic ' . base64_encode('app-user:app-password'),
            ['cookie', 'authorization', 'php-auth-user', 'php-auth-pw'],
        ];
        yield 'digest authentication' => [
            'Digest username="app-user", realm="app", nonce="n", uri="/proxy.php", response="r"',
            ['cookie', 'authorization', 'php-auth-digest'],
        ];
    }

    /**
     * @param list<string> $credentialHeaders headers the incoming request carries
     */
    #[DataProvider('applicationCredentials')]
    public function testDoesNotForwardTheApplicationsCookiesAndCredentials(string $authorization, array $credentialHeaders): void
    {
        $forwarded = null;
        $client = new MockHttpClient(static function (string $method, string $url, array $options) use (&$forwarded): MockResponse {
            $forwarded = $options['normalized_headers'];

            return new MockResponse('{}', ['http_code' => 200]);
        });
        $proxy = new Proxy($client);
        $request = Request::create('https://host.test/proxy.php', 'GET', server: [
            'HTTP_COOKIE' => 'PHPSESSID=app-session',
            'HTTP_AUTHORIZATION' => $authorization,
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest',
        ]);
        foreach ($credentialHeaders as $name) {
            self::assertTrue($request->headers->has($name), 'precondition: the request carries ' . $name);
        }

        $proxy->forward($request, 'https://em.example.org/app/a.json');

        self::assertIsArray($forwarded);
        self::assertSame(['accept: application/json'], $forwarded['accept'] ?? null);
        self::assertSame(['x-requested-with: XMLHttpRequest'], $forwarded['x-requested-with'] ?? null);
        foreach ($credentialHeaders as $name) {
            self::assertArrayNotHasKey($name, $forwarded, $name . ' must not reach the target');
        }
    }

    public function testDoesNotPassTheTargetsCookiesBackToTheBrowser(): void
    {
        $client = new MockHttpClient(new MockResponse('IMAGE-BYTES', [
            'http_code' => 200,
            'response_headers' => [
                'content-type' => 'image/png',
                'set-cookie' => 'EMSESSION=target-session; path=/',
                'x-upstream' => 'kept',
            ],
        ]));
        $proxy = new Proxy($client);

        $response = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), 'https://em.example.org/app/a.png');

        self::assertSame('image/png', $response->headers->get('content-type'));
        self::assertSame('kept', $response->headers->get('x-upstream'));
        self::assertNull($response->headers->get('set-cookie'));
        self::assertSame([], $response->headers->getCookies());
    }

    public function testDoesNotFollowRedirects(): void
    {
        // Two responses: if the proxy followed the redirect it would consume
        // the second (200) and return that instead of the 302.
        $client = new MockHttpClient([
            new MockResponse('', ['http_code' => 302, 'response_headers' => ['location' => 'https://cdn.example.com/x']]),
            new MockResponse('SHOULD-NOT-BE-FETCHED', ['http_code' => 200]),
        ]);
        $proxy = new Proxy($client);

        $response = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), 'https://example.com/a.png');

        self::assertSame(302, $response->getStatusCode());
    }
}
