<?php

$usedImages = json_decode($_POST['data']);
$t = 0;
foreach($usedImages as $img){
    $filePath = '../uploads/' . $img;
    if(!file_exists($filePath)){
        echo 'ERROR';
        die();
    }
}

$markedForDeletion = array();
$dir = new DirectoryIterator('../uploads');
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
        //echo $fileinfo->getFilename();
        if(!in_array($fileinfo->getFilename(),$usedImages)){
            array_push($markedForDeletion,$fileinfo->getFilename());
        }
    }
}
foreach($usedImages as $img){
    if(in_array($img,$markedForDeletion)){
        echo 'ERROR';
        die();
    }
}
// echo sizeof($usedImages);
// echo sizeof($markedForDeletion);
foreach($markedForDeletion as $img){
    $filePath = '../uploads/' . $img;
    if(file_exists($filePath)){
        unlink($filePath);
    }
}

?>