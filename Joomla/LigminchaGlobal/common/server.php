<?php
/**
 * Global Server
 */
class LigminchaGlobalServer extends LigminchaGlobalObject {

	// Current instance
	private static $current = null;

	// Master server
	private static $master = null;

	// Do we need to update this server object after we have a master?
	private static $deferred = false;

	// Are we the master server?
	public $isMaster = false;

	function __construct() {
		$this->checkMaster();
		$this->type = LG_SERVER;
		parent::__construct();
	}

	/**
	 * Determine whether or not this is the master site
	 */
	private function checkMaster() {
		$this->isMaster = LG_STANDALONE || ( $_SERVER['HTTP_HOST'] == self::masterDomain() );
	}

	/**
	 * What is the master domain?
	 */
	public static function masterDomain() {
		static $master;
		if( !$master ) {
			$config = JFactory::getConfig();
			if( !$master = $config->get( 'lgMaster' ) ) $master = 'ligmincha.org';
		}
		return $master;
	}

	/**
	 * Get the master server object
	 * - we have to allow master server to be optional so that everything keeps working prior to its object having been loaded
	 */
	public static function getMaster() {
		if( !self::$master ) {
			$domain = self::masterDomain();
			self::$master = self::getCurrent()->isMaster ? self::getCurrent() : self::selectOne( array( 'tag' => $domain ) );

			// Give our server a version and put our server on the update queue after we've established the master
			if( self::$master ) {
				lgDebug( 'Master obtained', self::$master );

				// Set the version (just use the first ver object for now while testing)
				if( $versions = LigminchaGlobalVersion::select() ) self::$current->ref1 = $versions[0]->id;

				// No version objects, create one now
				else {
					$ver = new LigminchaGlobalVersion( '0.0.0' );
					self::$current->ref1 = $ver->id;
				}

				// If this server object was created before we knew this master, we need to send
				if( self::$deferred ) {
					$server = self::getCurrent();
					$server->update();
					lgDebug( 'Server object updated', $server );
				}
			}
		}
		return self::$master;
	}

	/**
	 * Get/create current object instance
	 */
	public static function getCurrent() {
		if( is_null( self::$current ) ) {

			// Make a new uuid from the server's secret
			$config = JFactory::getConfig();
			$id = self::hash( $config->get( 'secret' ) );
			self::$current = self::newFromId( $id );

			// If the object was newly created, populate with default initial data and save
			if( !self::$current->tag ) {
				lgDebug( 'Server object created', self::$current );
				
				// Make it easy to find this server by domain
				self::$current->tag = $_SERVER['HTTP_HOST'];

				// Server information
				self::$current->data = self::serverData();

				// Save our new instance to the DB (if we have a master yet)
				if( self::$master ) {
					self::$current->update();
					lgDebug( 'Server object updated', self::$master );
				} else {
					self::$deferred = true;
					lgDebug( 'Server object update deferred, master unknown' );
				}
			} else lgDebug( 'Server object retrieved from database', self::$current );
		}

		// If we have a master and we're not in standalone, ensure the server data is up to date
		if( self::$master && !LG_STANDALONE ) {
			static $checked = false;
			if( !$checked ) {
				$checked = true;
				if( json_encode( self::$current->data ) !== json_encode( self::serverData( self::$current->data ) ) ) {
					self::$current->data = self::serverData( self::$current->data );
					self::$current->update();
				}
			}
		}

		return self::$current;
	}

	/**
	 * Make a new object given an id
	 */
	public static function newFromId( $id, $type = false ) {
		$obj = parent::newFromId( $id, LG_SERVER );
		$obj->checkMaster();
		return $obj;
	}

	/**
	 * Get the server and env data (merge with current data)
	 */
	public static function serverData( $data ) {
		$config = JFactory::getConfig();
		$version = new JVersion;
		$data['name']      = $config->get( 'sitename' );
		$data['webserver'] = $_SERVER['SERVER_SOFTWARE'];
		$data['system']    = php_uname('s') . ' (' . php_uname('m') . ')';
		$data['php']       = preg_replace( '#^([0-9.]+).*$#', '$1', phpversion() );
		$data['mysql']     = preg_replace( '#^(.+?\d\.\S+).*$#', '$1', mysqli_init()->client_info );
		$data['joomla']    = $version->getShortVersion();
		return $data;
	}

	/**
	 * Add this type to $cond
	 */
	public static function select( $cond = array() ) {
		$cond['type'] = LG_SERVER;
		return parent::select( $cond );
	}

	public static function selectOne( $cond = array() ) {
		$cond['type'] = LG_SERVER;
		return parent::selectOne( $cond );
	}
}
