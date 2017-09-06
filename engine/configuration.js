define(['display/documentUtils'], (docutil) => {
	'use strict';

	function meta(name, def) {
		return docutil.getMetaTagValue(name, def);
	}

	const site = meta('stack-exchange-site');
	const qid = meta('stack-exchange-qid');

	return {
		pageTitle: docutil.getTitle(),
		maxConcurrency: Math.max(1, Math.min(8, navigator.hardwareConcurrency - 3)),
		gameType: meta('game-type'),
		teamType: meta('team-type', 'free_for_all'),
		teamTypeArgs: JSON.parse(meta('team-type-args', '{}')),
		tournamentType: meta('tournament-type', 'brawl'),
		tournamentTypeArgs: JSON.parse(meta('tournament-type-args', '{}')),
		matchType: meta('match-type', 'brawl'),
		matchTypeArgs: JSON.parse(meta('match-type-args', '{}')),
		baseGameConfig: JSON.parse(meta('game-config', '{}')),
		basePlayConfig: JSON.parse(meta('play-config', '{}')),
		basePlayHiddenConfig: JSON.parse(meta(
			'play-hidden-config',
			'{"speed": -1, "maxTime": 250}'
		)),
		baseDisplayConfig: JSON.parse(meta('display-config', '{}')),
		teamViewColumns: JSON.parse(meta('team-view-columns', '[]')),
		defaultCode: meta('default-code', '// Code here\n'),
		site,
		qid,
		questionURL: meta(
			'stack-exchange-question-url',
			'https://' + site + '.stackexchange.com/questions/' + qid
		),
		githubLink: 'https://github.com/davidje13/koth-webplayer',
	};
});