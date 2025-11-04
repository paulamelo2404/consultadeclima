# 🌦️ Consulta de Clima

Um projeto moderno e responsivo para consultar as condições climáticas atuais de qualquer cidade ao redor do mundo. Desenvolvido com uma stack robusta para fornecer uma experiência de usuário rápida e intuitiva.

## ✨ Funcionalidades

* **Busca de Clima:** Consulte o clima atual de cidades específicas.
* **Informações Detalhadas:** Exibe temperatura, umidade, velocidade do vento e outras informações relevantes.
* **Design Responsivo:** Interface otimizada para visualização em dispositivos móveis e desktop.
* **Interface Moderna:** Utilização do `shadcn-ui` e `Tailwind CSS` para um design limpo e moderno.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com a seguinte stack de tecnologias:

| Categoria | Tecnologia | Uso/Função |
| :--- | :--- | :--- |
| **Plataforma de Criação** | **Lovable** | Ambiente de desenvolvimento inicial e prototipagem. |
| **Frontend Framework** | **React** | Biblioteca principal para a construção da interface do usuário. |
| **Linguagem** | **TypeScript** | Garante tipagem estática e maior robustez ao código. |
| **Estilização** | **Tailwind CSS** | Framework de CSS utility-first para design rápido. |
| **Componentes UI** | **shadcn-ui** | Componentes de interface elegantes e acessíveis. |
| **Ferramenta de Build** | **Vite** | Empacotador (bundler) rápido para o ambiente de desenvolvimento. |
| **Gerenciador de Pacotes** | **bun** ou **npm** | Gerenciamento de dependências do projeto. |

## 🛠️ Instalação e Uso

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

Certifique-se de ter o **Node.js** e o **npm** (ou **Bun**) instalados em sua máquina.

### Passos

1.  **Clone o Repositório**
    ```bash
    git clone [https://github.com/paulamelo2404/consultadeclima.git](https://github.com/paulamelo2404/consultadeclima.git)
    ```

2.  **Navegue até a Pasta do Projeto**
    ```bash
    cd consultadeclima
    ```

3.  **Instale as Dependências**

    Se estiver usando `npm`:
    ```bash
    npm install
    ```
    Ou, se estiver usando `Bun`:
    ```bash
    bun install
    ```

4.  **Inicie o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    # ou
    bun run dev
    ```

O projeto será iniciado em modo de desenvolvimento, geralmente acessível em `http://localhost:5173`.

---

## 🔑 Configuração da Chave da API

Para que a consulta de clima funcione, você precisará de uma chave de API de um serviço de clima (ex: OpenWeatherMap, WeatherAPI, etc.).

1.  Crie um arquivo `.env.local` na raiz do projeto.
2.  Adicione sua chave de API com o nome de variável que o projeto espera (exemplo: `VITE_CLIMATE_API_KEY`).

    ```dotenv
    VITE_CLIMATE_API_KEY="SUA_CHAVE_AQUI"
    ```
    *(Ajuste o nome da variável de ambiente conforme o que estiver sendo usado no código `src/`.)*

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` (se existir) para mais detalhes.

## 🧑‍💻 Autor

Desenvolvido por **paulamelo2404**.