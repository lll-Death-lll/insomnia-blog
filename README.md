<a id="readme-top"></a>


[![Issues][issues-shield]][issues-url]
[![Contributors][contributors-shield]][contributors-url]
[![License][license-shield]][license-url]
[![Stargazers][stars-shield]][stars-url]

<h3 align="center">Insomnia Blog</h3>

## Установка
1. Скачайте репозиторий
 ```sh
 git clone https://github.com/lll-Death-lll/insomnia-blog.git
 ```
3. Постройте Docker изображение
 ```sh
 sudo docker-compose build
 ```
3. Запустите при помощи Docker
 ```sh
 sudo docker-compose run -e \
  POSTGRES_DB={НАЗВАНИЕ_БАЗЫ_ДАННЫХ} \
  POSTGRES_USER={НАЗВАНИЕ_ПОЛЬЗОВАТЕЛЯ_БАЗЫ_ДАННЫХ} \
  POSTGRES_PASSWORD={ПАРОЛЬ_БАЗЫ_ДАННЫХ}
 ```

## Использование


<p align="right">(<a href="#readme-top">back to top</a>)</p>

[stars-shield]: https://img.shields.io/github/stars/lll-Death-lll/insomnia-blog?style=for-the-badge
[stars-url]: https://github.com/lll-Death-lll/insomnia-blog/stargazers
[license-shield]: https://img.shields.io/github/license/lll-Death-lll/insomnia-blog?style=for-the-badge
[license-url]: https://github.com/lll-Death-lll/insomnia-blog/blob/master/LICENSE
[contributors-shield]: https://img.shields.io/github/contributors/lll-Death-lll/insomnia-blog?style=for-the-badge
[contributors-url]: https://github.com/lll-Death-lll/insomnia-blog/graphs/contributors
[issues-shield]: https://img.shields.io/github/issues/lll-Death-lll/insomnia-blog?style=for-the-badge
[issues-url]: https://github.com/lll-Death-lll/insomnia-blog/issues
