const Team = () => {
  // Team members data
  const teamMembers = [
    {
      name: "President",
      role: "Club President",
      description: "Leading TechNova's vision and strategic initiatives",
      emoji: "👨‍💼",
    },
    {
      name: "Vice President",
      role: "Vice President",
      description: "Supporting operations and member engagement",
      emoji: "👩‍💼",
    },
    {
      name: "Technical Lead",
      role: "Technical Lead",
      description: "Overseeing technical workshops and projects",
      emoji: "👨‍💻",
    },
    {
      name: "Events Coordinator",
      role: "Events Manager",
      description: "Planning and executing club events",
      emoji: "📅",
    },
    {
      name: "Design Lead",
      role: "Design Lead",
      description: "Managing creative and design initiatives",
      emoji: "🎨",
    },
    {
      name: "Marketing Head",
      role: "Marketing Lead",
      description: "Promoting TechNova's events and achievements",
      emoji: "📢",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-galaxy-purple to-galaxy-blue text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-purple-100">Meet the people driving innovation at Tech Nova</p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{member.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-galaxy-purple font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Want to Join Our Team?</h2>
          <p className="text-lg text-gray-700 mb-8">
            TechNova is always looking for passionate students to join our core team. We recruit new members at the beginning of each academic year.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Leadership Opportunities</h3>
            <p className="text-gray-700 mb-4">
              Become a part of TechNova's leadership team and help shape the future of technology innovation on campus. Gain valuable experience in event management, team leadership, and community building.
            </p>
            <p className="text-sm text-gray-600">
              Applications open at the start of each semester. Stay tuned for announcements!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
