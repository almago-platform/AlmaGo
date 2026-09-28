module.exports = {
  ci: {
    collect: {
      url: [
        "http://127.0.0.1:3000/",
        "http://127.0.0.1:3000/login"
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage"
      }
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: "^http://127\\.0\\.0\\.1:3000/?$",
          assertions: {
            "categories:performance": ["warn", { minScore: 0.8 }],
            "categories:accessibility": ["warn", { minScore: 0.95 }],
            "categories:best-practices": ["warn", { minScore: 0.95 }],
            "categories:seo": ["warn", { minScore: 0.95 }]
          }
        },
        {
          matchingUrlPattern: "^http://127\\.0\\.0\\.1:3000/login/?$",
          assertions: {
            "categories:performance": ["warn", { minScore: 0.8 }],
            "categories:accessibility": ["warn", { minScore: 0.95 }],
            "categories:best-practices": ["warn", { minScore: 0.95 }]
          }
        }
      ]
    },
    upload: {
      target: "filesystem",
      outputDir: "artifacts/lighthouse"
    }
  }
};
