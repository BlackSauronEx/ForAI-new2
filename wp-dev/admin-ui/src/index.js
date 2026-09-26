/**
 * RVN Compare — интерфейс настроек 0.5.0 (каркас раунда A).
 *
 * Монтируется только в #rvn-compare-admin-root на странице «Compare».
 * Пакеты WordPress (@wordpress/element, @wordpress/components) берутся
 * из ядра через dependency extraction и в бандл не входят.
 * Все строки интерфейса приходят из PHP (window.rvnCompareAdminData.i18n)
 * уже переведёнными — wp.i18n здесь не используется, как и в скриптах витрины.
 */
import { createElement, createRoot, render } from '@wordpress/element';
import { Notice, TabPanel } from '@wordpress/components';

const data = window.rvnCompareAdminData || {};
const i18n = data.i18n || {};
const settings = data.settings || {};

function text( key, fallback ) {
	return typeof i18n[ key ] === 'string' && '' !== i18n[ key ] ? i18n[ key ] : fallback;
}

function ScaffoldPanel() {
	return createElement(
		'div',
		{ className: 'rvn-compare-admin-scaffold', 'data-testid': 'rvn-admin-app' },
		createElement(
			Notice,
			{ status: 'info', isDismissible: false },
			text(
				'scaffoldNotice',
				'The interactive settings interface is under construction for 0.5.0. Saving is not available yet.'
			)
		),
		createElement( 'h2', null, text( 'currentSettings', 'Current settings (read-only preview)' ) ),
		createElement(
			'table',
			{ className: 'widefat striped' },
			createElement(
				'tbody',
				null,
				createElement(
					'tr',
					null,
					createElement( 'th', { scope: 'row' }, text( 'limitTotal', 'Total limit' ) ),
					createElement( 'td', null, String( settings.limit_total ?? '' ) )
				),
				createElement(
					'tr',
					null,
					createElement( 'th', { scope: 'row' }, text( 'limitCategory', 'Category limit' ) ),
					createElement( 'td', null, String( settings.limit_per_category ?? '' ) )
				)
			)
		)
	);
}

function App() {
	return createElement( TabPanel, {
		className: 'rvn-compare-admin-tabs',
		activeClass: 'is-active',
		tabs: [
			{
				name: 'general',
				title: text( 'generalTab', 'General settings' ),
			},
		],
		children: function renderTab() {
			return createElement( ScaffoldPanel );
		},
	} );
}

( function mount() {
	const root = document.getElementById( 'rvn-compare-admin-root' );
	if ( ! root ) {
		return;
	}
	const app = createElement( App );
	if ( typeof createRoot === 'function' ) {
		createRoot( root ).render( app );
	} else {
		render( app, root );
	}
} )();
