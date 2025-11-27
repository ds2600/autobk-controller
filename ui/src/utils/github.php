<?php
// src/utils/github.php

function get_latest_release(string $repo, int $cacheSeconds = 3600): ?array {
    $cacheFile = __DIR__ . '/../../cache/release.json';
    $now = time();

    if (file_exists($cacheFile)) {
        $json = json_decode(file_get_contents($cacheFile), true);
        if ($json && ($json['ts'] + $cacheSeconds) > $now) {
            return $json['data'];
        }
    }

    $url = "https://api.github.com/repos/{$repo}/releases/latest";
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => [
                'User-Agent: AutoBk-Controller',
                'Accept: application/vnd.github.v3+json',
            ],
            'timeout' => 5,
        ],
    ];

    $context = stream_context_create($opts);
    $raw = @file_get_contents($url, false, $context);

    if ($raw === false) {
        if (isset($json['data'])) {
            return $json['data'];
        }
        return null;
    }

    $data = json_decode($raw, true);
    if (!isset($data['tag_name'])) {
        return null;
    }

    $tag = ltrim($data['tag_name'], 'v');

    $result = [
        'version'   => $tag,
        'url'       => $data['html_url'] ?? '',
        'name'      => $data['name'] ?? $tag,
    ];

    $toCache = ['ts' => $now, 'data' => $result];
    @file_put_contents($cacheFile, json_encode($toCache, JSON_PRETTY_PRINT));

    return $result;
}
