<?php
$topmenu = file_get_contents( 'http://www.ligmincha.org/menus/topmenu-pt-br.inc.php' );
if( preg_match( '|^<ul.+?</ul>\s*$|s', $topmenu ) ) {
	file_put_contents( __DIR__ . '/topmenu-pt-br.html', $topmenu );
}
