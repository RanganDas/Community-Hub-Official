import React from "react";
import "./About.css"; // Import the CSS file for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const About = () => {
  return (
    <div className="about-page">
      {/* Cover Section */}
      <div className="about-cover"></div>

      {/* Heading Section */}
      <h1 className="about-heading">
        Community Hub – More Than Social, It's Personal
      </h1>

      {/* Description Section */}
      <div className="about-description">
        <p>
          Welcome to <strong>Community Hub</strong>, the ultimate platform
          designed to keep you connected, informed, and engaged with the world
          around you. Whether you're looking to share your thoughts, connect
          with friends, or explore stories from a diverse community, Community
          Hub is your go-to platform for everything social. Here, you can create
          and share your own stories, connect with like-minded individuals, and
          stay updated with the latest trends and happenings. Our platform is
          built with simplicity and functionality in mind, ensuring a seamless
          experience for users of all ages and backgrounds. From sharing your
          daily updates to engaging with the stories of others, Community Hub
          empowers you to express yourself freely and creatively. Community Hub
          is the brainchild of <strong>Rangan Das</strong>, a passionate web
          developer with a vision to bring people closer together in an
          ever-evolving digital world. With a strong background in computer
          science and a dedication to crafting meaningful user experiences,
          Rangan has designed this platform to be more than just a social media
          site – it's a space for growth, collaboration, and inspiration. Our
          mission is to foster a sense of community and belonging among users
          while promoting meaningful connections and positive interactions. Join
          us in building a vibrant and inclusive digital space where everyone
          has a voice, and every story matters.
        </p>

        <p>
          This site was created by <strong>Rangan Das</strong>, a passionate web
          developer with a vision to create meaningful contributions to the
          digital world. Thank you for being part of this journey!
        </p>
      </div>

      {/* Footer Section */}
      <footer className="about-footer">
        <p>Follow us on:</p>
        <div className="social-icons">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} color="pink" size="2x" />
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} color="skyblue" size="2x" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default About;
