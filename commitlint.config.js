module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'setting',
        'feat',
        'fix',
        'style',
        'docs',
        'refactor',
        'rename',
        'delete',
        'chore',
        'test',
        'build',
        'setting',
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
  },
};
