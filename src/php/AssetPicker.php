<?php
/**
 * See class comment
 *
 * PHP Version 5
 *
 * @category Netresearch
 * @package  Netresearch
 * @author   Christian Opitz <christian.opitz@netresearch.de>
 * @license  http://www.netresearch.de Netresearch Copyright
 * @link     http://www.netresearch.de
 */

namespace Netresearch;

/**
 * Class AssetPicker
 *
 * @category Netresearch
 * @package  Netresearch
 * @author   Christian Opitz <christian.opitz@netresearch.de>
 * @license  http://www.netresearch.de Netresearch Copyright
 * @link     http://www.netresearch.de
 */
class AssetPicker
{
    /**
     * Get the path to the dist directory
     *
     * @return string
     */
    public static function getDistPath()
    {
        return __DIR__ . '/../../dist';
    }
}

?>
