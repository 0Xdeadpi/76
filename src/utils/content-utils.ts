import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// Retrieve posts and sort them by publication date (降序：最新在上)
async function getRawSortedPosts() {
  const allBlogPosts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const sorted = allBlogPosts.sort((a, b) => {
    // 转换为时间戳进行可靠比较
    const timeA = new Date(a.data.published).getTime();
    const timeB = new Date(b.data.published).getTime();

    // 处理无效日期的情况（NaN），无效的排到最后
    if (isNaN(timeA) && isNaN(timeB)) return 0;
    if (isNaN(timeA)) return 1;   // a 无效 → 排后面
    if (isNaN(timeB)) return -1;  // b 无效 → 排后面

    // 核心：timeB - timeA → 正数表示 b 更新（b 应该排在 a 前面）
    return timeB - timeA;
  });

  return sorted;
}

export async function getSortedPosts() {
  const sorted = await getRawSortedPosts();

  // 为每篇文章添加 prev/next 链接（保持原逻辑）
  for (let i = 1; i < sorted.length; i++) {
    sorted[i].data.nextSlug = sorted[i - 1].slug;
    sorted[i].data.nextTitle = sorted[i - 1].data.title;
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    sorted[i].data.prevSlug = sorted[i + 1].slug;
    sorted[i].data.prevTitle = sorted[i + 1].data.title;
  }

  return sorted;
}

export type PostForList = {
  slug: string;
  data: CollectionEntry<"posts">["data"];
};

export async function getSortedPostsList(): Promise<PostForList[]> {
  const sortedFullPosts = await getRawSortedPosts();

  // delete post.body（只保留 slug + data，用于列表页）
  const sortedPostsList = sortedFullPosts.map((post) => ({
    slug: post.slug,
    data: post.data,
  }));

  return sortedPostsList;
}

export type Tag = {
  name: string;
  count: number;
};

export async function getTagList(): Promise<Tag[]> {
  const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const countMap: { [key: string]: number } = {};
  allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
    post.data.tags.forEach((tag: string) => {
      if (!countMap[tag]) countMap[tag] = 0;
      countMap[tag]++;
    });
  });

  // sort tags alphabetically
  const keys: string[] = Object.keys(countMap).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
  name: string;
  count: number;
  url: string;
};

export async function getCategoryList(): Promise<Category[]> {
  const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  const count: { [key: string]: number } = {};
  allBlogPosts.forEach((post: { data: { category: string | null } }) => {
    if (!post.data.category) {
      const ucKey = i18n(I18nKey.uncategorized);
      count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
      return;
    }

    const categoryName =
      typeof post.data.category === "string"
        ? post.data.category.trim()
        : String(post.data.category).trim();

    count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
  });

  const lst = Object.keys(count).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  const ret: Category[] = [];
  for (const c of lst) {
    ret.push({
      name: c,
      count: count[c],
      url: getCategoryUrl(c),
    });
  }
  return ret;
}
