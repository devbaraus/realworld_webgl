```python
from PIL import Image

size = (8192,8192)

image = Image.open('img/land_ocean_ice_8192.png')
new_image = image.resize(size)
new_image.save('img/earthmap_squared.jpg')
```

```python
from PIL import Image

size = (2048,2048)

image = Image.open('img/cloud_combined_2048.jpg')
new_image = image.resize(size)
new_image.save('img/earthcloud_squared.jpg')
```


```python
from PIL import Image

size = (8192,8192)

image = Image.open('8k_earth_daymap.jpg')
new_image = image.resize(size)
new_image.save('earthmap_squared.jpg')
```