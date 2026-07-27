<?php

declare(strict_types=1);

namespace Netresearch\AssetPicker\Tests;

use Netresearch\AssetPicker\Proxy;
use PHPUnit\Framework\Attributes\CoversClass;
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
