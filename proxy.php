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

$request = \Symfony\Component\HttpFoundation\Request::createFromGlobals();

try {
    if ($request->query->has('to')) {
        $proxyTo = $request->query->get('to');
        $request->query->remove('to');
        $proxy = new \Netresearch\AssetPicker\Proxy();
        $proxy->forward($request)->to($proxyTo)->send();
    } else {
        throw new Exception('No target provided');
    }
} catch (\Exception $e) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
    echo $e;
}
