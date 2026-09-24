<?php

declare(strict_types=1);

namespace Netresearch\AssetPicker\Tests;

use Netresearch\AssetPicker\Proxy;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\NoPrivateNetworkHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

#[CoversClass(Proxy::class)]
final class ProxyTest extends TestCase
{
    /**
     * A public address: the documentation ranges (192.0.2.0/24 and so on) are
     * in IpUtils::PRIVATE_SUBNETS and would be refused. The mock clients never
     * connect to it.
     */
    private const PUBLIC_TARGET = 'https://93.184.215.14/a.png';

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
    /**
     * @return iterable<string, array{string}>
     */
    public static function privateTargets(): iterable
    {
        yield 'loopback' => ['https://127.0.0.1/admin'];
        yield 'loopback IPv6' => ['https://[::1]/admin'];
        yield 'localhost' => ['https://localhost/admin'];
        yield 'RFC 1918 10/8' => ['https://10.0.0.1/'];
        yield 'RFC 1918 172.16/12' => ['https://172.16.0.1/'];
        yield 'RFC 1918 192.168/16' => ['https://192.168.1.1/'];
        yield 'link-local, cloud metadata' => ['https://169.254.169.254/latest/meta-data/'];
        yield 'link-local IPv6' => ['https://[fe80::1]/'];
        yield 'carrier-grade NAT' => ['https://100.64.0.1/'];
        yield 'unique local IPv6' => ['https://[fd00::1]/'];
        // .invalid never resolves (RFC 6761); an address that cannot be
        // checked is refused.
        yield 'unresolvable host' => ['https://assetpicker.invalid/'];
    }

    /**
     * The client proxy.php gets: new Proxy() without a client. The ports are
     * closed, so without the protection the request fails with a connection
     * error instead of the 403.
     *
     * @return iterable<string, array{string}>
     */
    public static function privateTargetsWithoutListener(): iterable
    {
        yield 'loopback' => ['https://127.0.0.1:1/'];
        yield 'loopback IPv6' => ['https://[::1]:1/'];
    }

    #[DataProvider('privateTargetsWithoutListener')]
    public function testTheDefaultClientRefusesPrivateTargets(string $target): void
    {
        $response = (new Proxy())->forward(Request::create('https://host.test/proxy.php', 'GET'), $target);

        self::assertSame(403, $response->getStatusCode());
        self::assertSame('Target not allowed', $response->getContent());
    }

    #[DataProvider('privateTargets')]
    public function testRefusesPrivateTargetsWithoutRequestingThem(string $target): void
    {
        $requests = 0;
        $proxy = new Proxy(new NoPrivateNetworkHttpClient(new MockHttpClient(
            static function () use (&$requests): MockResponse {
                ++$requests;

                return new MockResponse('INTERNAL', ['http_code' => 200]);
            },
        )));

        $response = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), $target);

        self::assertSame(403, $response->getStatusCode());
        self::assertSame('Target not allowed', $response->getContent());
        self::assertSame(0, $requests, 'the target must not be requested');
    }

    public function testForwardsToAPublicTargetThroughTheProtection(): void
    {
        $requests = 0;
        $proxy = new Proxy(new NoPrivateNetworkHttpClient(new MockHttpClient(
            static function () use (&$requests): MockResponse {
                ++$requests;

                return new MockResponse('IMAGE-BYTES', ['http_code' => 200]);
            },
        )));

        $response = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), self::PUBLIC_TARGET);

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('IMAGE-BYTES', $response->getContent());
        self::assertSame(1, $requests);
    }

    public function testRefusesATargetWhoseConnectionEndsUpOnAPrivateAddress(): void
    {
        // The address the client actually connected to (primary_ip) is
        // checked as well, for example when DNS answers differently later.
        $proxy = new Proxy(new NoPrivateNetworkHttpClient(new MockHttpClient(
            new MockResponse('INTERNAL', ['http_code' => 200, 'primary_ip' => '10.0.0.5']),
        )));

        $response = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), self::PUBLIC_TARGET);

        self::assertSame(403, $response->getStatusCode());
        self::assertSame('Target not allowed', $response->getContent());
    }

    public function testRefusesATargetThatIsBlockedWhileTheResponseIsRead(): void
    {
        // With a real client the connected address is only known during the
        // transfer, so the refusal surfaces from reading the response, not
        // from request(). The mock above reports it synchronously; this one
        // raises the same refusal from the body.
        $body = static function (): \Generator {
            yield 'INTERNAL';

            throw new TransportException('IP "10.0.0.5" is blocked for "' . self::PUBLIC_TARGET . '".');
        };
        $proxy = new Proxy(new MockHttpClient(new MockResponse($body(), ['http_code' => 200])));

        $response = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), self::PUBLIC_TARGET);

        self::assertSame(403, $response->getStatusCode());
        self::assertSame('Target not allowed', $response->getContent());
    }

    public function testRefusesARedirectFromAPublicTargetToAPrivateAddress(): void
    {
        $private = 'https://169.254.169.254/latest/meta-data/';
        $requested = [];
        $proxy = new Proxy(new NoPrivateNetworkHttpClient(new MockHttpClient(
            static function (string $method, string $url) use (&$requested, $private): MockResponse {
                $requested[] = $method . ' ' . $url;

                return new MockResponse('', ['http_code' => 302, 'response_headers' => ['location' => $private]]);
            },
        )));

        // The redirect is not followed but sent back to the browser, pointing
        // at the proxy again ...
        $redirect = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), self::PUBLIC_TARGET);
        self::assertSame(302, $redirect->getStatusCode());
        self::assertSame(
            'https://host.test/proxy.php?to=' . urlencode($private),
            $redirect->headers->get('location'),
        );

        // ... where the redirect target is checked like any other target.
        $followed = $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), $private);
        self::assertSame(403, $followed->getStatusCode());
        self::assertSame(['GET ' . self::PUBLIC_TARGET], $requested, 'the private redirect target must not be requested');
    }

    public function testThrowsTransportErrorsThatAreNotARefusal(): void
    {
        $proxy = new Proxy(new NoPrivateNetworkHttpClient(new MockHttpClient(
            new MockResponse([new \RuntimeException('Connection timed out')]),
        )));

        $this->expectException(TransportExceptionInterface::class);
        $proxy->forward(Request::create('https://host.test/proxy.php', 'GET'), self::PUBLIC_TARGET);
    }
}
