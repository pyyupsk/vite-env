{{#each releases}}
## [{{this.version}}]({{this.url}}) ({{this.date}})

{{#if this.features.length}}
### &nbsp;&nbsp;&nbsp;✨ Features

{{#each this.features}}
- {{#if this.component}}**{{this.component}}**: {{/if}}{{this.subject}} ({{this.pullRequest}})
{{/each}}

{{/if}}
{{#if this.bugFixes.length}}
### &nbsp;&nbsp;&nbsp;🐞 Bug Fixes

{{#each this.bugFixes}}
- {{#if this.component}}**{{this.component}}**: {{/if}}{{this.subject}} ({{this.pullRequest}})
{{/each}}

{{/if}}
{{#if this.documentation.length}}
### &nbsp;&nbsp;&nbsp;📝 Documentation

{{#each this.documentation}}
- {{#if this.component}}**{{this.component}}**: {{/if}}{{this.subject}} ({{this.pullRequest}})
{{/each}}

{{/if}}
{{#if this.chores.length}}
### &nbsp;&nbsp;&nbsp;🛠 Chores

{{#each this.chores}}
- {{#if this.component}}**{{this.component}}**: {{/if}}{{this.subject}} ({{this.pullRequest}})
{{/each}}

{{/if}}
{{/each}}
