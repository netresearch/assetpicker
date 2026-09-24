<?php

/**
 * Minimal reverse proxy for the asset picker.
 *
 * @category Netresearch
 * @package  Netresearch\AssetPicker
 * @author   Christian Opitz <christian.opitz@netresearch.de>
 * @license  http://www.netresearch.de Netresearch Copyright
 * @link     http://www.netresearch.de
 */

declare(strict_types=1);

namespace Netresearch\AssetPicker;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Forwards an incoming request to a target URL and returns the upstream
 * response. Redirects are not followed but rewritten to route the client
 * back through this proxy (via the {@see proxy.php} `?to=` entry point).
 *
 * Replaces the abandoned jenssegers/proxy (which pinned the EOL guzzle 6)
 * with symfony/http-client.
 */
class Proxy
{
    /**
     * Hop-by-hop headers that must not be forwarded end to end (RFC 7230 6.1).
     *
     * @var list<string>
     */
    private const HOP_BY_HOP = [
        'connection',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'transfer-encoding',
        'upgrade',
    ];

    /**
     * Request headers carrying the host application's credentials. The proxy
     * runs on the application's domain, so the browser sends them with every
     * request to it; they must not reach the target. PHP_AUTH_USER,
     * PHP_AUTH_PW and PHP_AUTH_DIGEST appear as headers because
     * {@see \Symfony\Component\HttpFoundation\ServerBag::getHeaders()} derives
     * them from HTTP authentication.
     *
     * @var list<string>
     */
    private const CREDENTIAL_HEADERS = [
        'cookie',
        'authorization',
        'php-auth-user',
        'php-auth-pw',
        'php-auth-digest',
    ];

    private readonly HttpClientInterface $client;

    public function __construct(?HttpClientInterface $client = null)
    {
        // Do not follow redirects: they are rewritten in forward() so the
        // client re-requests the target through this proxy.
        $this->client = $client ?? HttpClient::create(['max_redirects' => 0]);
    }

    /**
     * Forward the given request to the target URL and build the response.
     */
    public function forward(Request $request, string $target): Response
    {
        $upstream = $this->client->request($request->getMethod(), $target, [
            'headers' => $this->forwardableHeaders($request),
            'body' => $request->getContent(),
            'max_redirects' => 0,
        ]);

        // Pass false everywhere so 3xx/4xx/5xx do not raise exceptions.
        $response = new Response($upstream->getContent(false), $upstream->getStatusCode());

        foreach ($upstream->getHeaders(false) as $name => $values) {
            if (!in_array(strtolower($name), self::HOP_BY_HOP, true)) {
                $response->headers->set($name, $values);
            }
        }

        // Cookies set by the target would be stored for the application's
        // domain, not the target's.
        $response->headers->remove('set-cookie');

        $response->prepare($request);
        $response->headers->remove('transfer-encoding');

        if ($response->isRedirect()) {
            $this->rewriteRedirect($request, $response);
        }

        return $response;
    }

    /**
     * Copy request headers to forward, dropping hop-by-hop, the application's
     * credentials and Host (the outgoing Host is derived from the target URL
     * by the HTTP client).
     *
     * @return array<string, list<string>>
     */
    private function forwardableHeaders(Request $request): array
    {
        $headers = [];
        foreach ($request->headers->all() as $name => $values) {
            $lower = strtolower((string) $name);
            if (
                $lower !== 'host'
                && !in_array($lower, self::HOP_BY_HOP, true)
                && !in_array($lower, self::CREDENTIAL_HEADERS, true)
            ) {
                $headers[(string) $name] = $values;
            }
        }

        return $headers;
    }

    /**
     * Rewrite an upstream redirect so the client follows it back through the
     * proxy instead of hitting the target host directly.
     *
     * The proxy URL is the base URL plus the path info: `/proxy.php` for the
     * standalone script (path info `/`), `/assetpicker` or
     * `/index.php/assetpicker` for a route behind a front controller.
     */
    private function rewriteRedirect(Request $request, Response $response): void
    {
        $path = $request->getBaseUrl();
        if ($request->getPathInfo() !== '/') {
            $path .= $request->getPathInfo();
        }

        $response->headers->set(
            'location',
            $request->getSchemeAndHttpHost() . $path . '?to='
            . urlencode((string) $response->headers->get('location'))
        );
    }
}
