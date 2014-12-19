<?php

include_once realpath(__DIR__ . '../../php/cache.php');
include_once realpath(__DIR__ . '../../php/util.php');

/**
 * Class Host
 * Represent Sync Host Manager
 */
class HostManager
{
    /**
     * @var string rCache Key
     */
    public $hash = 'sync_host.dat';

    /**
     * @var array Configuration
     */
    private $all = array();

    /**
     * Use load to get instance
     */
    final private function __construct()
    {
    }

    /**
     * Load from cache the host config
     *
     * @return HostManager
     */
    public static function load()
    {
        $instance = new self();

        $cache = new rCache();
        $cache->get($instance);

        return $instance;
    }

    /**
     * Serialize the config
     * Use by rCache
     *
     * @return array
     */
    public function __sleep()
    {
        return array('all');
    }

    /**
     * Get all Host config
     *
     * @return array
     */
    public function getAll()
    {
        return $this->all;
    }

    /**
     * Get one Host config by Id
     *
     * @param string $id Host Id
     *
     * @return null|array
     */
    public function get($id)
    {
        return isset($this->all[$id]) ? $this->all[$id] : null;
    }

    /**
     * Build URL to upload file by CURL
     *
     * @param string      $id       Host Id
     * @param null|string $filename Filename to upload
     *
     * @return string
     */
    public function getCurlUrl($id, $filename = null)
    {
        if (null !== $configuration = $this->get($id)) {
            $path = trim($configuration['path'], '/');

            $command = sprintf(
                '%s://%s%s/%s%s',
                $configuration['protocol'] == 'ftpes' ? 'ftps' : $configuration['protocol'],
                $configuration['host'],
                empty($configuration['port']) ? '' : sprintf(':%d', $configuration['port']),
                empty($path) ? '' : $path . '/',
                empty($filename) ? '' : trim($filename, '/')
            );

            return $command;
        }

        throw new \InvalidArgumentException();
    }

    /**
     * Get the needed options by CURL to upload file
     *
     * @param string $id Host Id
     *
     * @return string
     */
    public function getCurlOptions($id)
    {
        if (null !== $configuration = $this->get($id)) {
            $options = array();

            switch ($configuration['protocol']) {
                case 'ftpes':
                case 'ftps':
                    $options[] = '--ftp-ssl';

                case 'sftp':
                    $options[] = '--insecure';
                    break;
            }

            if ($configuration['secure'] == 'certificate' && !empty($configuration['certificate_private']) && !empty($configuration['certificate_public']) && !empty($configuration['username'])) {
                $options[] = sprintf(
                    '--user %s:',
                    $configuration['username']
                );

                $options[] = sprintf('--key %s', escapeshellarg($this->getCertifatePrivateFilename($id, $configuration['certificate_private'])));
                $options[] = sprintf('--pubkey %s', escapeshellarg($this->getCertifatePublicFilename($id, $configuration['certificate_public'])));

                if (!empty($configuration['certificate_passphrase'])) {
                    $options[] = sprintf('--pass %s', $configuration['certificate_passphrase']);
                }
            }

            if ($configuration['secure'] == 'identity' && !empty($configuration['username']) && !empty($configuration['password'])) {
                $options[] = sprintf(
                    '--user %s:%s',
                    $configuration['username'],
                    $configuration['password']
                );
            }

            return implode(' ', $options);
        }

        throw new \InvalidArgumentException();
    }

    /**
     * Add a Host config
     *
     * @param array $configuration
     *
     * @return bool
     */
    public function add(array $configuration)
    {
        $this->all[$id] = array_merge($configuration, array('id' => $id = uniqid()));

        if ($configuration['certificate_private']) {
            $this->setCertifatePrivate($id, $configuration['certificate_private']);
        }

        if ($configuration['certificate_public']) {
            $this->setCertifatePublic($id, $configuration['certificate_public']);
        }

        $this->save();
    }

    /**
     * Update a Host config
     *
     * @param string $id            Host Id
     * @param array  $configuration Config
     *
     * @return bool
     */
    public function update($id, array $configuration)
    {
        if (isset($this->all[$id])) {
            $this->all[$id] = $configuration;

            $this->deleteCertifatePrivate($id);
            $this->deleteCertifatePublic($id);

            if ($configuration['certificate_private']) {
                $this->setCertifatePrivate($id, $configuration['certificate_private']);
            }

            if ($configuration['certificate_public']) {
                $this->setCertifatePublic($id, $configuration['certificate_public']);
            }

            $this->save();
        }
    }

    /**
     * Delete a Host config
     *
     * @param string $id Host Id
     *
     * @return bool
     */
    public function delete($id)
    {
        if (isset($this->all[$id])) {
            unset($this->all[$id]);

            $this->deleteCertifatePrivate($id);
            $this->deleteCertifatePublic($id);

            $this->save();
        }
    }

    /**
     * Delete all config
     */
    public function reset()
    {
        foreach ($this->all as $id => $configuration) {
            unset($this->all[$id]);

            $this->deleteCertifatePrivate($id);
            $this->deleteCertifatePublic($id);
        }

        $this->save();
    }

    /**
     * Save all config
     */
    public function save()
    {
        $cache = new rCache();
        $cache->set($this);
    }

    /**
     * Filename of the saved private key
     *
     * @param string $id Host Id
     *
     * @return string
     */
    public function getCertifatePrivateFilename($id)
    {
        return sprintf('%s/%s.priv', getSettingsPath(), $id);
    }

    /**
     * Filename of the saved public key
     *
     * @param string $id Host Id
     *
     * @return string
     */
    public function getCertifatePublicFilename($id)
    {
        return sprintf('%s/%s.pub', getSettingsPath(), $id);
    }

    /**
     * Save the private key
     *
     * @param string $id      Host Id
     * @param string $content Key content
     */
    public function setCertifatePrivate($id, $content)
    {
        file_put_contents($this->getCertifatePrivateFilename($id), $content);
    }

    /**
     * Save the public key
     *
     * @param string $id      Host Id
     * @param string $content Key content
     */
    public function setCertifatePublic($id, $content)
    {
        file_put_contents($this->getCertifatePublicFilename($id), $content);
    }

    /**
     * Delete the private key
     *
     * @param string $id Host Id
     */
    public function deleteCertifatePrivate($id)
    {
        if (file_exists($filename = $this->getCertifatePrivateFilename($id))) {
            unlink($filename);
        }
    }

    /**
     * Delete the public key
     *
     * @param string $id Host Id
     */
    public function deleteCertifatePublic($id)
    {
        if (file_exists($filename = $this->getCertifatePublicFilename($id))) {
            unlink($filename);
        }
    }
}