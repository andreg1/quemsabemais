<?php

$image = $_FILES['image'];
$fileName = 'bannerPub.' . pathinfo($image["name"], PATHINFO_EXTENSION);
$filePath = '../images/' . $fileName;

move_uploaded_file($image['tmp_name'], $filePath);

echo 'images/' . $fileName;

?> 