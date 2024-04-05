import WarfareUnitSheet from './sheet.js';
import extendActor from './unit.js';

Hooks.on('init', () => {
	Actors.registerSheet('dnd5e', WarfareUnitSheet, {
		types: ['npc'],
		makeDefault: false,
		label: 'WARFARE.Sheet'
	});
	extendActor();
});

Hooks.on('setup', () => {
	CONFIG.DND5E.abilityActivationTypes.order = game.i18n.localize('WARFARE.Order');
});

Hooks.on('ready', () => {
	game.settings.register('warfare', 'theme', {
		name: 'WARFARE.Theme',
		scope: 'user',
		config: true,
		default: 'light',
		type: String,
		onChange: setTheme,
		choices: {
			'light': 'WARFARE.Light',
			'dark': 'WARFARE.Dark'
		}
	});

	setTheme(game.settings.get('warfare', 'theme'));
});

Handlebars.registerHelper('number-format', function (n, options) {
	if (n == null) {
		return '';
	}

	const places = options.hash.decimals || 0;
	const sign = !!options.hash.sign;
	n = parseFloat(n).toFixed(places);
	return sign && n >= 0 ? '+' + n : n;
});

Handlebars.registerHelper('or', function (...args) {
	args.pop();
	return args.reduce((acc, x) => acc || !!x);
});

function setTheme (theme) {
	const head = document.getElementsByTagName('head')[0];
	if (theme === 'dark') {
		const link = document.createElement('link');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.href = 'modules/warfare/styles/dark.css';
		link.id = 'warfare-dark-sheet';
		head.appendChild(link);
	} else {
		const sheet = document.getElementById('warfare-dark-sheet');
		if (sheet) {
			sheet.remove();
		}
	}
}

document.addEventListener('click', evt => {
	const target = evt.target;
	const parent = evt.target.parentElement;

	if (!target.classList.contains('warfare-config-rm-item')
		&& !parent?.classList.contains('warfare-config-rm-item'))
	{
		$('.warfare-config-rm-item.warfare-alert').removeClass('warfare-alert');
	}
});
