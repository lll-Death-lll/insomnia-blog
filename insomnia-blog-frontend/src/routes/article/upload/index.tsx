import { $, component$, useStore } from "@builder.io/qwik";
import { server$, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

interface UploadForm {
  title: string;
  content: string;
  article_url: string;
  image_url: string;
  username: string;
  password: string;
}

export default component$(() => {
  const nav = useNavigate();

  const formData = useStore<UploadForm>({
    title: "",
    content: "",
    article_url: "",
    image_url: "",
    username: "",
    password: "",
  });

  const handleSubmit = $(async () => {
    const validateForm = () => {
      if (!formData.title) {
        alert("Title is required");
        return false;
      }
      if (!formData.content) {
        alert("Content is required");
        return false;
      }
      if (!formData.article_url) {
        alert("Invalid article URL");
        return false;
      }
      if (!formData.image_url || !isValidUrl(formData.image_url)) {
        alert("Invalid image URL");
        return false;
      }
      if (!formData.username) {
        alert("Username is required");
        return false;
      }
      if (!formData.password) {
        alert("Password is required");
        return false;
      }
      return true;
    };

    const isValidUrl = (urlString: string) => {
      try {
        new URL(urlString);
        return true;
      } catch (_) {
        return false;
      }
    };

    if (!validateForm()) {
      return;
    }

    try {
      const articleUrl = await uploadArticle(formData);
      console.log(`Added article with url: ${articleUrl}`);
      const url = `/article/${articleUrl}`;
      nav(url);
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <div class="flex justify-center p-8">
      <form preventdefault:submit onSubmit$={handleSubmit}>
        <div class="flex min-w-max flex-row justify-between">
          <label class="text-xl" for="title">
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onInput$={(e) => {
              formData.title = (e.target as HTMLInputElement).value;
            }}
            required
          />
        </div>
        <div class="flex min-w-max flex-col justify-between">
          <label class="text-xl" for="content">
            Content:
          </label>
          <input
            type="file"
            accept=".md"
            onChange$={async (e) => {
              const target = e.target as HTMLInputElement;
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (target.files && target.files[0]) {
                const file = target.files[0];
                try {
                  const fileContent = await file.text();
                  formData.content = fileContent;
                } catch (error) {
                  console.error("Error reading file:", error);
                  formData.content = "Error: Could not read file content.";
                }
              } else {
                formData.content = "";
              }
            }}
          />
        </div>
        <div class="flex min-w-max flex-row justify-between">
          <label class="text-xl" for="article_url">
            Article URL:
          </label>
          <input
            type="text"
            id="article_url"
            value={formData.article_url}
            onInput$={(e) => {
              formData.article_url = (e.target as HTMLInputElement).value;
            }}
            required
          />
        </div>
        <div class="flex min-w-max flex-row justify-between">
          <label class="text-xl" for="image_url">
            Image URL:
          </label>
          <input
            type="url"
            id="image_url"
            value={formData.image_url}
            onInput$={(e) => {
              formData.image_url = (e.target as HTMLInputElement).value;
            }}
          />
        </div>
        <div class="flex min-w-max flex-row justify-between">
          <label class="text-xl" for="username">
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onInput$={(e) => {
              formData.username = (e.target as HTMLInputElement).value;
            }}
            required
          />
        </div>
        <div class="flex min-w-max flex-row justify-between">
          <label class="text-xl" for="password">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onInput$={(e) => {
              formData.password = (e.target as HTMLInputElement).value;
            }}
            required
          />
        </div>
        <div class="flex flex-row justify-center">
          <button
            class="rounded-xl bg-purple-500 px-4 py-1 text-2xl text-white transition-transform ease-in-out hover:cursor-pointer hover:border-2 hover:border-purple-500 hover:bg-transparent hover:text-black"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
});

export const uploadArticle = server$(async function (
  data: UploadForm,
): Promise<string> {
  const response = await fetch("http://api:3000/api/article", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const url: string = await response.text();

  return url;
});

export const head: DocumentHead = {
  title: "Upload | Insomnia Blog",
};
