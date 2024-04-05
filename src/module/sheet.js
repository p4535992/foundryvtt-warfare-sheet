export default class WarfareUnitSheet extends dnd5e.applications.actor.ActorSheet5e {
	static get defaultOptions () {
		return mergeObject(super.defaultOptions, {
			classes: ['warfare', 'warfare-unit'],
			scrollY: ['form'],
			width: 340,
			height: 415
		});
	}

	get template () {
		return 'modules/warfare/templates/unit-card.html';
	}

	activateListeners (html) {
		super.activateListeners(html);
		if (!this.isEditable) {
			return;
		}

		html.find('.warfare-unit-config').click(this._onConfigClicked.bind(this));
		html.find('.warfare-config-add-item').click(this._onAddItem.bind(this));
		html.find('.warfare-config-rm-item').click(this._onRemoveItem.bind(this));
		html.find('.warfare-config-edit-item').click(this._onEditItem.bind(this));
		html.find('.warfare-unit-casualties-pip').click(this._onCasualtyClicked.bind(this));
		html.find('[data-roll]').click(this._onRollAttribute.bind(this));
	}

	async getData () {
		const data = await super.getData();
		data.warfare = duplicate(this.actor.flags.warfare || {});
		data.unitCost = data.warfare.stats?.cost == null ? '—' : data.warfare.stats.cost;
		data.warfareItems = {
			traits: [],
			actions: [],
			orders: []
		};

		for (const item of data.items) {
			const activation = item.system.activation.type;
			if (activation === 'action') {
				data.warfareItems.actions.push(item);
			} else if (activation === 'order') {
				data.warfareItems.orders.push(item);
			} else {
				data.warfareItems.traits.push(item);
			}

			item.system.description.enriched =
				await TextEditor.enrichHTML(item.system.description.value, {
					secrets: data.owner,
					documents: true,
					links: true,
					rolls: true,
					rollData: this.actor.getRollData(),
					async: true
				});
		}

		if (data.warfare.stats?.casualties?.max) {
			this._formatCasualties(data.warfare.stats.casualties);
		}

		return data;
	}

	_formatCasualties (casualties) {
		let display = '';
		for (let i = 1; i <= casualties.max; i++) {
			const classes = ['warfare-unit-casualties-pip'];
			if (i <= casualties.remaining) {
				classes.push('warfare-unit-casualties-pip-full');
			} else {
				classes.push('warfare-unit-casualties-pip-empty');
			}

			display += `<div class="${classes.join(' ')}" data-n="${i}"><span></span></div>`;
		}

		casualties.display = display;
	}

	_onAddItem (evt) {
		const dataset = evt.currentTarget.dataset;
		const system = {
			activation: {
				cost: dataset.cost ? Number(dataset.cost) : null,
				type: dataset.type || ""
			}
		};

		let name = 'NewTrait';
		if (dataset.type === 'action') {
			name = 'NewAction';
		}

		if (dataset.type === 'order') {
			name = 'NewOrder';
		}

		this.actor.createEmbeddedDocuments('Item', [{
			system,
			type: 'feat',
			name: game.i18n.localize(`WARFARE.${name}`)
		}], {renderSheet: true});
	}

	_onEditItem (evt) {
		const item = this.actor.items.get(evt.currentTarget.parentElement.dataset.itemId);
		item.sheet.render(true);
	}

	_onRemoveItem (evt) {
		const target = evt.currentTarget;
		if (!target.classList.contains('warfare-alert')) {
			target.classList.add('warfare-alert');
			return;
		}

		this.actor.deleteEmbeddedDocuments('Item', [target.parentElement.dataset.itemId]);
	}

	_onCasualtyClicked (evt) {
		const casualties = this.actor.getFlag('warfare', 'stats.casualties');
		const n = Number(evt.currentTarget.dataset.n);
		let taken = casualties.taken;

		if (n > casualties.remaining) {
			taken--;
		} else {
			taken++;
		}

		if (taken > -1 && taken <= casualties.max) {
			this.actor.setFlag('warfare', 'stats.casualties.taken', taken);
		}
	}

	_onChangeInputDelta () {
		// Disable this entirely as this behaviour is counter-intuitive for
		// this sheet.
	}

	_onConfigClicked () {
		const currentStatus = !!this.actor.getFlag('warfare', 'sheet.config');
		this.actor.setFlag('warfare', 'sheet.config', !currentStatus);
	}

	_onRollAttribute (evt) {
		this.actor.rollUnitAttribute(evt.currentTarget.dataset.roll, {event: evt});
	}

	_prepareItems () {

	}
}
