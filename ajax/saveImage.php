<?php
print_r($_FILES);

//$imageName = $_POST['imageName'];
$image = $_FILES['image'];
//$fileName = time() . $imageName;
$fileName = time() . $image["name"];
$filePath = $_SERVER['DOCUMENT_ROOT'] . '\\uploads\\' . $fileName;

//move_uploaded_file($image['tmp_name'], $filePath);
copy($image['tmp_name'], $filePath);

$filePath = "/uploads/" . $fileName;
echo $filePath;

?> 