export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
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
        'example',
      ],
    ],
  },
};
