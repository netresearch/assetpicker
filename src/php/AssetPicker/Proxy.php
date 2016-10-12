<?php
/**
 * See class comment
 *
 * PHP Version 5
 *
 * @category Netresearch
 * @package  Netresearch\AssetPicker
 * @author   Christian Opitz <christian.opitz@netresearch.de>
 * @license  http://www.netresearch.de Netresearch Copyright
 * @link     http://www.netresearch.de
 */

namespace Netresearch\AssetPicker;
use Proxy\Adapter\Guzzle\GuzzleAdapter;

/**
 * Class Proxy
 *
 * @category Netresearch
 * @package  Netresearch\AssetPicker
 * @author   Christian Opitz <christian.opitz@netresearch.de>
 * @license  http://www.netresearch.de Netresearch Copyright
 * @link     http://www.netresearch.de
 */
class Proxy extends \Proxy\Proxy
{
    /**
     * Proxy constructor.
     */
    public function __construct()
    {
        parent::__construct(new GuzzleAdapter());
        $this->addResponseFilter(function(\Symfony\Component\HttpFoundation\Response $response) {
            $response->prepare($this->request);
            if ($response->headers->has('transfer-encoding')) {
                $response->headers->remove('transfer-encoding');
            }
            if ($response->isRedirect()) {
                $baseUrl = $this->request->getBaseUrl();
                if (basename($baseUrl) !== basename($this->request->getScriptName())) {
                    $baseUrl .= $this->request->getPathInfo();
                }
                $response->headers->set(
                    'location',
                    $this->request->getSchemeAndHttpHost() . $baseUrl . '?to='
                    . urlencode($response->headers->get('location'))
                );
            }
        });
    }
}

?>
