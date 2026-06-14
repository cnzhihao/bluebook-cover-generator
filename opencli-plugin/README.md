# Bluebook Cover Generator OpenCLI Plugin

通过 Browser Bridge 调用蓝皮书封面生成网页，并将 PNG 写入本地。

```bash
opencli plugin install file:///absolute/path/to/bluebook-cover-generator/opencli-plugin
opencli bluebook-cover-generator generate '人工智能产业蓝皮书' \
  --subtitle '2026 年趋势与实践' \
  --org '示例研究院' \
  --output ./蓝皮书封面.png \
  -f json
```

本地开发时可切换网页地址：

```bash
BLUEBOOK_GENERATOR_URL=http://127.0.0.1:8000 \
  opencli bluebook-cover-generator generate '测试蓝皮书' -f json
```
