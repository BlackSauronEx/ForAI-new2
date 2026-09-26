<?php
/**
 * Каркас интерфейса настроек 0.5.0: React-приложение на компонентах WordPress.
 *
 * PHP регистрирует страницу, проверяет права, передаёт nonce и текущие
 * настройки, а динамический интерфейс рисует собранный бандл
 * assets/admin/settings.js. Сохранение в раунде A отсутствует: приложение
 * только показывает данные (контракт санитайзера вступит с первой
 * сохраняющей вкладкой — единственным валидатором останется
 * Settings::sanitize()).
 *
 * @package RVN_Compare
 */

namespace RVN_Compare\Admin;

use RVN_Compare\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Подключает скрипты и выводит корневой контейнер приложения настроек.
 */
final class Settings_App {

	/**
	 * Хэндл скрипта настроек.
	 *
	 * @var string
	 */
	const HANDLE = 'rvn-compare-admin-settings';

	/**
	 * Подключает загрузку скриптов на странице настроек.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'admin_enqueue_scripts', array( self::class, 'enqueue' ) );
	}

	/**
	 * Подключает собранный бандл только на вкладке «General» страницы «Compare».
	 *
	 * Если бандл не собран (разработчик не запускал build.sh), скрипты тихо
	 * не подключаются, и на экране остаётся PHP-заглушка с объяснением.
	 *
	 * @return void
	 */
	public static function enqueue(): void {
		$screen = get_current_screen();

		if ( ! $screen instanceof \WP_Screen || false === strpos( $screen->id, Admin::PAGE_SLUG ) ) {
			return;
		}

		// Это чтение вкладки ничего не меняет. Изменения проходят отдельный POST с nonce.
		$tab = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'general'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( 'general' !== $tab ) {
			return;
		}

		$asset_path = RVN_COMPARE_PATH . 'assets/admin/settings.asset.php';
		$js_path    = RVN_COMPARE_PATH . 'assets/admin/settings.js';

		if ( ! is_readable( $asset_path ) || ! is_readable( $js_path ) ) {
			return;
		}

		$asset = include $asset_path;

		if ( ! is_array( $asset ) || ! isset( $asset['dependencies'], $asset['version'] ) || ! is_array( $asset['dependencies'] ) ) {
			return;
		}

		$dependencies = array();

		foreach ( $asset['dependencies'] as $dependency ) {
			if ( is_string( $dependency ) ) {
				$dependencies[] = $dependency;
			}
		}

		$version = is_string( $asset['version'] ) ? $asset['version'] : RVN_COMPARE_VERSION;

		wp_register_script( self::HANDLE, RVN_COMPARE_URL . 'assets/admin/settings.js', $dependencies, $version, true );

		$data = wp_json_encode( self::bootstrap_data() );

		if ( ! is_string( $data ) ) {
			return;
		}

		wp_add_inline_script( self::HANDLE, 'window.rvnCompareAdminData = ' . $data . ';', 'before' );
		wp_enqueue_script( self::HANDLE );
	}

	/**
	 * Выводит корневой контейнер приложения и заглушку на случай сбоя JS.
	 *
	 * React при успешном запуске заменяет содержимое контейнера; если бандл
	 * не загрузился, администратор видит понятное объяснение, а не пустоту.
	 *
	 * @return void
	 */
	public static function render(): void {
		?>
		<div id="rvn-compare-admin-root" class="rvn-compare-admin">
			<div class="notice notice-warning inline">
				<p><?php esc_html_e( 'The settings interface could not be loaded. Please reload the page; if the problem persists, a plugin or browser extension may be blocking the script.', 'rvn-compare-products-for-woocommerce' ); ?></p>
			</div>
			<noscript><p><?php esc_html_e( 'Enable JavaScript to use the comparison settings interface.', 'rvn-compare-products-for-woocommerce' ); ?></p></noscript>
		</div>
		<?php
	}

	/**
	 * Собирает данные для приложения: версию, nonce, настройки и строки.
	 *
	 * Строки интерфейса переводятся здесь, в PHP, поэтому бандл не содержит
	 * вызовов wp.i18n — так же устроены скрипты витрины.
	 *
	 * @return array<string, mixed>
	 */
	private static function bootstrap_data(): array {
		$settings = Settings::all();

		return array(
			'version'  => RVN_COMPARE_VERSION,
			'nonce'    => wp_create_nonce( 'rvn_compare_admin' ),
			'settings' => array(
				'limit_total'        => (int) ( $settings['limit_total'] ?? 50 ),
				'limit_per_category' => (int) ( $settings['limit_per_category'] ?? 12 ),
			),
			'i18n'     => array(
				'generalTab'      => __( 'General settings', 'rvn-compare-products-for-woocommerce' ),
				'scaffoldNotice'  => __( 'The interactive settings interface is under construction for 0.5.0. Saving is not available yet.', 'rvn-compare-products-for-woocommerce' ),
				'currentSettings' => __( 'Current settings (read-only preview)', 'rvn-compare-products-for-woocommerce' ),
				'limitTotal'      => __( 'Total limit', 'rvn-compare-products-for-woocommerce' ),
				'limitCategory'   => __( 'Category limit', 'rvn-compare-products-for-woocommerce' ),
			),
		);
	}
}
