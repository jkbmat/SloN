<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title></title>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="shortcut icon" href="favicon.png" />
<link rel="stylesheet" href="styles.css" />

<?php
$images = findFiles("./img");
$sounds = findFiles("./sound");

function findFiles($dir)
{
	if (is_dir($dir)) {
		if ($dh = opendir($dir)) {
			while (($file = readdir($dh)) !== false) {
				if($file != '.' && $file != '..')
				{
					if(filetype("{$dir}/{$file}") != 'dir')
					{
						$files[sizeof($files)]['src'] = "\"{$dir}/{$file}\"";
						$files[sizeof($files) - 1]['name'] = "\"$file\"";
						$files[sizeof($files) - 1]['size'] = filesize("{$dir}/{$file}");
					}
				}
			}
			closedir($dh);
			return $files;
		}
	}
}


?>

<script language="javascript" type="text/javascript" src="Base.js"></script> <!-- Base library -->
<script language="javascript" type="text/javascript" src="./soundmanager/soundmanager2.js"></script> <!-- prehravanie zvuku -->
<script language="javascript" type="text/javascript">
soundManager.url = './soundmanager/';
soundManager.flashVersion = 9;
soundManager.useFlashBlock = false;
soundManager.defaultOptions.useWaveformData = true;
</script>
<script language="javascript" type="text/javascript">
	var preload_images = [<?php 
				  	if($images)
					{
						$loadtotal = 0;
						for($i = 0; $i < sizeof($images); $i++)
						{
							echo "[{$images[$i]['name']}, {$images[$i]['src']}, {$images[$i]['size']}]";
							$loadtotal += $images[$i]['size'];
							if($i + 1 < sizeof($images))
								echo ", ";
						}
					}
				  ?>];
	var preload_images_loadtotal = <?php echo $loadtotal == 0 ? '0' : $loadtotal; ?>;
	
	var preload_sounds = {<?php 
				  	if($sounds)
					{
						for($i = 0; $i < sizeof($sounds); $i++)
						{
							echo "{$sounds[$i]['name']}: {$sounds[$i]['src']},\n";
						}
					}
					
				  ?>};
</script> <!-- Obrazky pre preload -->

<script language="javascript" type="text/javascript">

var preload_fonts = []; // for font preloading

</script>

<script language="javascript" type="text/javascript" src="SloN.js"></script> <!-- engine -->
<script language="javascript" type="text/javascript" src="program.js"></script> <!-- program -->
<script language="javascript" type="text/javascript" src="objects.js"></script> <!-- objekty -->


<style type="text/css">
 #okno
 {
	 margin: auto;
	 position: relative;
	 top: 20px;
	 min-width: 20px;
	 min-height: 20px;
 }
</style>
</head>
<body onload="preloadF();">
<div></div> <!-- zvuky -->
<h1>the SloN engine is loading..</h1>
<div id='okno'>
<canvas id='plocha'></canvas>
<canvas id='overlayer'></canvas>
<span style='font-size: 6px; float: right;'>2010 by NAME, uses SloN engine</span>
</div>
</body>

</body>
</html>
