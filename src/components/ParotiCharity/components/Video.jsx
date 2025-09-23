import React from 'react';
import { videoData } from '../data/siteData';

// ===========================
// COMPOSANT VIDEO CONTENT
// ===========================
const VideoContent = ({ content }) => {
  return (
    <div className="col-md-12 col-lg-6">
      <div className="video-one__content">
        <div className="sec-title">
          <p className="sec-title__tagline">{content.tagline}</p>
          <h2 className="sec-title__title">{content.title}</h2>
        </div>
        <p className="video-one__text">{content.text}</p>
        <div className="video-one__btns">
          <a href={content.button.link} className="thm-btn video-one__btn">
            <span>{content.button.text}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT VIDEO PLAYER
// ===========================
const VideoPlayer = ({ videoUrl, backgroundImage }) => {
  return (
    <div className="col-md-12 col-lg-6">
      <div className="video-one__video">
        <div 
          className="video-one__video__bg"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
        <a 
          href={videoUrl} 
          className="video-one__video__btn video-popup"
          aria-label="Play video"
        >
          <i className="fa fa-play"></i>
          <span className="video-one__video__btn__ripple"></span>
        </a>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT VIDEO PRINCIPAL
// ===========================
const Video = () => {
  const { backgroundImage, content } = videoData;

  return (
    <section className="sec-pad-top sec-pad-bottom video-one">
      <div className="container">
        <div 
          className="video-one__inner"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="row gutter-y-60">
            <VideoContent content={content} />
            <VideoPlayer 
              videoUrl={content.videoUrl} 
              backgroundImage={backgroundImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Video;
