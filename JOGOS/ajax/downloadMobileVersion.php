<?php 

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$filename = "../tmp/mobile-version.zip";
if (file_exists($filename)) unlink($filename);


$ignore_files = array('.','..','administration.html','tmp','database.json','index.html','play.html');
$ignored_folders = array('ajax','js/admin','mobile');

$zip = new ZipArchive();
if (!$zip->open($filename, ZIPARCHIVE::CREATE)) {
    return false;
}

$source = "../";
$source = str_replace('\\', '/', realpath($source));


if (is_dir($source) === true)
{
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source), RecursiveIteratorIterator::SELF_FIRST);

    foreach ($files as $file)
    {
        $file = str_replace('\\', '/', $file);

        // Ignore "." and ".." folders
        if( in_array(substr($file, strrpos($file, '/')+1), $ignore_files)) 
            continue;           

        $ignore_file = false;
        foreach ($ignored_folders as $folder){
            if(strpos($file, $folder) !== false){
                $ignore_file = true;
                break;
            }
        }            
        if($ignore_file) continue;

        $file = realpath($file);

        if (is_dir($file) === true)
        {
            $zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
        }
        else if (is_file($file) === true)
        {
            $zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
        }
    }
}
else if (is_file($source) === true)
{
    $zip->addFromString(basename($source), file_get_contents($source));
}

$zip->addFromString('database.json', 'var data = ' . file_get_contents('../database.json') . ';');
$zip->addFile('../mobile/index.html','index.html');
$zip->addFile('../mobile/play.html','play.html');

$zip->close();

header("Content-type: application/zip"); 
header("Content-Disposition: attachment; filename=mobileVersion.zip");
header("Content-length: " . filesize("../tmp/mobile-version.zip"));
header("Pragma: no-cache"); 
header("Expires: 0"); 
readfile('../tmp/mobile-version.zip');



?>