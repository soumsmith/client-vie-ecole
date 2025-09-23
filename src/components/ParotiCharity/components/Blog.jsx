import React from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { blogData } from "../data/siteData";

// ===========================
// COMPOSANT BLOG CARD
// ===========================
const BlogCard = ({ post }) => {
  return (
    <div
      className="item tns-item tns-slide-cloned"
      aria-hidden="true"
      tabIndex={-1}
    >
      <div className="blog-card">
        <div className="blog-card__image">
          <img src={post.image} alt={post.title} height={200}/>
          {/* /.blog-card__date */}
        </div>

        <div className="blog-card__content pb-3">
          <div className="blog-card__meta gap-3">
            <div className="blog-card__meta__item">
              <i className="fa fa-calendar"></i>
              <span>{post.date}</span>
            </div>
            <div className="blog-card__meta__item">
              <i className="fa fa-user"></i>
              <span>By {post.author}</span>
            </div>
            <div className="blog-card__meta__item">
              <i className="fa fa-tag"></i>
              <span>{post.category}</span>
            </div>
          </div>
        </div>

        {/* /.blog-card__image */}
        <div className="blog-card__content pt-0">
          {/* /.blog-card__meta */}
          <h3 className="blog-card__title">
            <a className="text-limit-2 fs-5" href={post.link}>{post.title}</a>
          </h3>
          <p className="blog-card__text text-limit-2 fs-7">{post.text}</p>

          {/* /.blog-card__title */}
          <a href={post.link} className="blog-card__links">
            <i className="fa fa-angle-double-right" />
            Read More
          </a>
          {/* /.blog-card__links */}
        </div>
        {/* /.blog-card__content */}
      </div>
      {/* /.blog-card */}
    </div>
  );
};

// ===========================
// COMPOSANT BLOG CAROUSEL AVEC SPLIDE
// ===========================
const BlogCarousel = ({ posts }) => {
  // Configuration Splide
  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '20px',
    pagination: false,
    arrows: true,
    autoplay: false,
    speed: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    breakpoints: {
      992: {
        perPage: 2,
        gap: '20px',
      },
      768: {
        perPage: 1,
        gap: '15px',
      },
    },
  };

  return (
    <div className="blog-carousel-wrapper">
      <Splide
        options={splideOptions}
        className="blog-splide-carousel"
        aria-label="Blog Posts Carousel"
      >
        {posts.map((post) => (
          <SplideSlide key={post.id}>
            <div className="blog-slide-item">
              <BlogCard post={post} />
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};

// ===========================
// COMPOSANT BLOG GRID (Alternative)
// ===========================
const BlogGrid = ({ posts }) => {
  return (
    <div className="row gutter-y-30">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};

// ===========================
// COMPOSANT BLOG PRINCIPAL
// ===========================
const Blog = ({ useCarousel = true }) => {
  const { section, posts } = blogData;

  return (
    <section className="sec-pad-top sec-pad-bottom">
      <div className="container">
        <div className="sec-title">
          <p className="sec-title__tagline">{section.tagline}</p>
          <h2 className="sec-title__title">{section.title}</h2>
        </div>

        {useCarousel ? (
          <BlogCarousel posts={posts} />
        ) : (
          <BlogGrid posts={posts} />
        )}
      </div>
    </section>
  );
};

export default Blog;
