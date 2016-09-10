<?php
/**
 * Example standalone implementation
 *
 * PHP Version 5
 *
 * @category Netresearch
 * @author   Christian Opitz <christian.opitz@netresearch.de>
 * @license  http://www.netresearch.de Netresearch Copyright
 * @link     http://www.netresearch.de
 */

function includeIfExists($file) {
    if (file_exists($file)) {
        return include $file;
    }
}
if ((!$loader = includeIfExists(__DIR__ . '/vendor/autoload.php')) && (!$loader = includeIfExists(__DIR__.'/../../autoload.php'))) {
    die('You must set up the project dependencies, run the following commands:'.PHP_EOL.
        'curl -s http://getcomposer.org/installer | php'.PHP_EOL.
        'php composer.phar install'.PHP_EOL);
}

use Symfony\Component\HttpFoundation\Request;

$request = Request::createFromGlobals();

try {
    if ($request->query->has('to')) {
        $proxyTo = $request->query->get('to');
        $request->query->remove('to');
        $proxy = \Proxy\Factory::create()->forward($request);
        $proxy->addResponseFilter(function(\Symfony\Component\HttpFoundation\Response $response) use ($request) {
            $response->prepare($request);
            if ($response->headers->has('transfer-encoding')) {
                $response->headers->remove('transfer-encoding');
            }
            if ($response->isRedirect()) {
                $response->headers->set(
                    'location',
                    $request->getSchemeAndHttpHost() . $request->getBaseUrl() . '?to='
                    . urlencode($response->headers->get('location'))
                );
            }
        });
        $proxy->to($proxyTo)->send();
    } else {
        throw new Exception('No target provided');
    }
} catch (\Exception $e) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
    echo $e;
}
