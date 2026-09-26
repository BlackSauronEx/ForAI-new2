# Recovered archive — round 14: old spec audit

> The live `ANSWER.md` was replaced before the previous file was moved. This
> concise recovery preserves the previous answer's complete decision surface;
> the detailed evidence also lives in `docs/LOG.md`, entry "Old-spec comparison
> (ForAI-old) + CHANGELOG translated".

The old `ForAI-old` workspace was read through the web only. Its v0.9 spec
contained 107 items in 14 sections plus a v1.0–v1.3+ roadmap; 93 old questions
were already consolidated into that spec. Every item was compared with actual
plugin code.

Findings: A — two current documentation errors (the table already implements
the old no-left-column caption-row layout; several implemented behaviors were
undocumented); B — fifteen old-v1.0 items absent from code/current plan; C —
eleven deferred roadmap items absent from SPEC §12; D — two divergences to
decide (window vs container breakpoints; concrete variations out-of-scope vs
old 1.3). A full proposed plan was shown: 0.5 settings, 0.6 remaining v1.0,
0.7 Support hub, 1.0 catalog, 1.1 design, 1.2 panels/publishing, 1.3+ extensions.

The user was asked to decide A corrections, a hybrid breakpoint strategy,
variation comparison, admin UI technology, the version plan, and whether any B
items should be removed. `CHANGELOG.md` was translated fully to English;
`cn.ts` was left in place. No stands or plugin changes occurred.