```python
from PIL import Image

size = (8192,8192)

image = Image.open('img/8k_earth_daymap.jpg')
new_image = image.resize(size)
new_image.save('img/earthmap_squared.jpg')
```

```python
from PIL import Image

size = (8192,8192)

image = Image.open('8k_earth_daymap.jpg')
new_image = image.resize(size)
new_image.save('earthmap_squared.jpg')
```