const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-galaxy-purple to-galaxy-blue text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">About TechNova</h1>
          <p className="text-xl text-purple-100">Innovation & Technology Club</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            TechNova is a student-driven innovation and technology club dedicated to empowering the next generation of technologists. We provide a platform for students to explore emerging technologies, collaborate on innovative projects, and develop skills that will shape their future careers.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Through hands-on workshops, hackathons, expert talks, and collaborative projects, we foster a community where creativity meets technology, and ideas transform into reality.
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">🎯 Events & Workshops</h3>
              <p className="text-gray-700">
                We organize regular events including hackathons, coding competitions, tech talks, and hands-on workshops covering AI/ML, Web Development, Mobile App Development, Cloud Computing, and more.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">🤝 Community Building</h3>
              <p className="text-gray-700">
                TechNova brings together students passionate about technology, creating an inclusive environment for learning, collaboration, and networking with peers and industry professionals.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">💡 Project Collaboration</h3>
              <p className="text-gray-700">
                Members collaborate on real-world projects, contributing to open-source initiatives, and building solutions that address practical challenges using cutting-edge technologies.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">🚀 Skill Development</h3>
              <p className="text-gray-700">
                We provide resources, mentorship, and opportunities for students to develop technical skills, leadership abilities, and professional competencies essential for success in the tech industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Values</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🌟</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-700">We encourage creative thinking and experimentation, pushing boundaries to discover new solutions.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🎓</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Learning</h3>
                <p className="text-gray-700">Continuous learning is at our core. We provide resources and opportunities for growth at every skill level.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">🤗</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inclusivity</h3>
                <p className="text-gray-700">TechNova welcomes everyone, regardless of background or experience level, creating a supportive community.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-3xl">💪</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-700">We strive for excellence in everything we do, from organizing events to building projects.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
