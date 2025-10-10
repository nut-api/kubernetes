# Taurus loadtesting tool

```bash
# to install the tool
brew install bzt
```

config file

```yaml
quick_test.yml
existing_jmeter_script.yml
complex_yaml_script.yml
execution:
- concurrency: 100
  ramp-up: 1m
  hold-for: 5m
  scenario: quick-test

scenarios:
  quick-test:
    requests:
    - http://blazedemo.com
```

run the test
```bash
bzt quick_test.yaml
```
