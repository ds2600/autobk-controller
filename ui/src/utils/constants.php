<?php

$versionContents = file_get_contents(__DIR__ . '/../../VERSION');

define('WEB_VERSION', trim($versionContents));
