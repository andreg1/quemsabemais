<?php
//print_r($_SERVER);

//$imageName = $_POST['imageName'];
$file = $_FILES['file'];
//$fileName = time() . $imageName;
$fileName = time() . $file["name"];
$filePath = '../uploads/';

move_uploaded_file($file['tmp_name'], $filePath . $fileName);
//$filePath = "/uploads/" . $fileName;
//copy($image['tmp_name'], $filePath);

//echo $filePath;
//echo $_SERVER["DOCUMENT_ROOT"];

echo json_encode(array('path' => 'uploads/' . $fileName));

?> 