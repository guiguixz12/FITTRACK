# design-reference/

Fonte da verdade visual para o rebuild tela a tela.

## Arquivo principal
`~/Downloads/design_handoff_mobile_redesign/FitTrack Mobile.dc.html`

Abrir no browser para ver o protótipo completo (todas as telas).

## Tokens aplicados no rebuild (dark theme — diverge do mockup original)
| Token | Valor |
|-------|-------|
| bg página | `#0D0D0D` |
| bg card/hero | `#1A1A1C` |
| border | `#26262A` solid |
| border-hi | `#34343A` |
| texto | `#F2F2F0` |
| texto-dim | `#8A8A8E` |
| texto-faint | `#6A6A6E` |
| accent (lime) | `#C4E538` |
| accent-dim | `rgba(196,229,56,0.15)` |
| accent-warm | `#FF9142` |
| font | `Manrope 500/600/700/800` |

## Mapeamento de cores mockup → dark
| Mockup | Dark theme |
|--------|-----------|
| `oklch(0.24 0.03 40)` hero bg | `#1A1A1C` |
| `#fff` card bg | `#1A1A1C` |
| `oklch(0.68 0.19 41)` orange | `#C4E538` (accent) ou `#FF9142` (warm) |
| `oklch(0.2 0.01 50)` text | `#F2F2F0` |
| `oklch(0.55 0.01 50)` muted | `#8A8A8E` |
| `Sora` font | `Manrope` |

## Ordem de migração
1. ✅ Home (Início)
2. ⬜ Dieta
3. ⬜ Treino (lista)
4. ⬜ Progresso
5. ⬜ Config
6. ⬜ Treino ativo / modais
