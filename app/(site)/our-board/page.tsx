import Image from "next/image";
import { Section } from "@/components/Section";
import { BoardSilhouette } from "@/components/BoardSilhouette";

export const metadata = { title: "Our Board" };

const FOUNDER = {
  name: "Dr. Jay Samant",
  role: "Founder and Chief Executive Officer",
  photo: "/board/jay-samant.jpg",
  paragraphs: [
    "Dr. Jay Samant is an educator, school designer, and equity advocate with more than 16 years of experience in K-12 and higher education leadership. He is a Bush Education Strategies (BES) Fellow, one of the most competitive school-launch fellowships in the country, which he completed through the design and development of Zenith College and Career Prep. That process included deep community engagement in Maryvale, research into Arizona's education landscape, and the creation of the school model that forms the foundation of this application.",
    "Prior to founding Zenith, Dr. Samant served in leadership roles at STRIVE Prep, a high-performing Denver charter network, and with the Community College of Denver, where he developed early college programming that gave high school students access to real college credit. His work has consistently focused on closing opportunity gaps through rigorous, community-centered school design.",
    "Dr. Samant founded Zenith because he believes Maryvale's students deserve a school built with them, not just for them. His vision is a high school where every graduate leaves with college credit, career clarity, and the confidence to lead in whatever future they choose.",
  ],
};

type BoardMember = {
  name: string;
  focus: string;
  photo?: string;
  paragraphs: string[];
};

const BOARD: BoardMember[] = [
  {
    name: "Robert Barlow, Ph.D.",
    focus: "People Strategy and Governance",
    photo: "/board/robert-barlow.jpg",
    paragraphs: [
      "Robert Barlow is an education and people strategy leader whose career spans public charter education, workforce development, nonprofit governance, and military and government service. He previously served as Director of Talent for the largest Title I K-8 public charter school network in Arizona, leading talent and people strategy for more than 800 employees serving over 10,000 students statewide. He also serves as Secretary of the Board of Directors at the George Washington Carver Museum and Cultural Center.",
      "Dr. Barlow holds a doctorate in ethical leadership, with research focused on improving outcomes for individuals transitioning out of foster care, informed in part by his own lived experience. That perspective shapes his approach to governance: accountable, grounded in mission, and centered on the students and families the board is meant to serve.",
      "As a member of the Zenith founding team, Robert brings deep familiarity with governance readiness, organizational design, and high-accountability charter environments. He is committed to building a board that holds Zenith to its mission while ensuring students in Maryvale have access to consistent leadership, strong role models, and high-quality college and career pathways.",
    ],
  },
  {
    name: "George Saad, Esq.",
    focus: "Legal and Organizational Governance",
    photo: "/board/george-saad.jpg",
    paragraphs: [
      "George Saad is the Founder and Managing Attorney of PLATZ JURIS, PLLC, a Phoenix-based law firm focused on intellectual property, business law, and civil litigation. He serves businesses across the United States as a trusted legal partner and fractional general counsel, drawing on a background that bridges law, operations, and organizational leadership.",
      "Before entering the legal profession, George spent more than two decades leading and scaling international education, managing K-12 college-prep schools across multiple countries and developing high-performance teams rooted in ethics, accountability, and innovation. Raised across Lebanon, England, Canada, and the United States, he brings a multilingual, global perspective to every institution he serves.",
      "George's combined experience in education leadership and law makes him a distinctive voice on the Zenith board. He brings principled decision-making, a deep belief in the transformative power of schools, and the legal expertise to help Zenith govern with integrity as it moves from application to operation.",
    ],
  },
  {
    name: "Michael Finch, B.S.",
    focus: "Real Estate, Finance, and Investment Strategy",
    photo: "/board/michael-finch.jpg",
    paragraphs: [
      "Michael Finch is a commercial real estate entrepreneur and investment strategist with nearly two decades of experience building national platforms in the single-family residential and build-for-rent sectors. He was the Principal Founder and Executive Vice President of SVN | SFRhub Advisors, SFRhub.com, and SVN SFR Capital Management, companies he grew into nationally recognized leaders in their asset class, regularly transacting one to two billion dollars in annual pipeline.",
      "Michael founded ULI's Single Family Residential Product Council as its inaugural Chairman, bringing together private equity, debt, developers, and asset managers to expand thought leadership in residential investment on a global scale. He now applies that expertise to a new investment fund focused on acquiring and managing distressed income-producing assets, with a particular interest in solving housing affordability challenges.",
      "Michael brings to the Zenith board a builder's mindset, financial acumen, and a track record of creating institutions that last. His experience scaling organizations from the ground up, navigating complex capital environments, and leading with integrity translates directly to the governance and growth challenges of launching a new public school.",
    ],
  },
  {
    name: "Jade Nangah, B.A.",
    focus: "Brand Strategy and Communications",
    photo: "/board/jade-nangah.jpg",
    paragraphs: [
      "Jade Nangah is a content strategist and personal brand advisor who helps founders and executives translate their expertise into clear, credible visibility. With more than a decade of experience across startups, growth-stage companies, and Fortune 500 brands, her work centers on making complex thinking legible through strategic content that builds trust and accelerates growth.",
      "Jade specializes in founder-led content systems and thought leadership across LinkedIn, long-form media, and emerging AI-driven discovery channels. Her approach blends narrative clarity with disciplined execution, helping leaders show up consistently, communicate with authority, and remain visible in a market where credibility is increasingly established online.",
      "For Zenith, Jade brings an essential perspective: how a new school communicates before it has a track record is as important as what it builds after. Her expertise in positioning, storytelling, and brand-building will help Zenith establish trust with families, partners, and funders long before the first student walks through the door.",
    ],
  },
  {
    name: "Lynn Palacios, M.Ed.",
    focus: "Curriculum, Instruction, and School Design",
    photo: "/board/lynn-palacios.jpg",
    paragraphs: [
      "Lynn Palacios is an educational leader and instructional coach with more than three decades of experience designing and leading innovative secondary and postsecondary learning programs. She currently serves as Instructional Coach at Barry Goldwater High School in the Deer Valley Unified School District, where her work has contributed to the school being named Arizona's first Solution Tree Model PLC High School.",
      "Lynn has been a founding educator and program leader at some of Arizona's most innovative schools, including Phoenix Coding Academy and Bioscience High School, where she developed transdisciplinary projects, coordinated community-based internship programs, and built meaningful partnerships with industry and higher education. She also brings more than a decade of experience as adjunct faculty at Phoenix College, teaching college composition in both online and in-person formats.",
      "Lynn's deep expertise in STEAM education, project-based learning, dual enrollment, and instructional design makes her one of Zenith's most critical assets during the school design phase. She brings the practitioner's knowledge of what rigorous, equity-centered instruction actually looks like in a classroom, not just in a charter application.",
    ],
  },
  {
    name: "Tom Nevill, Ph.D.",
    focus: "Higher Education Partnership and Academic Affairs",
    photo: "/board/tom-nevill.jpg",
    paragraphs: [
      "Dr. Tom Nevill serves as Vice President of Academic Affairs at GateWay Community College in Phoenix, where he is the Chief Academic Officer and a member of the president's leadership team. He oversees academic programs spanning healthcare, technology, business, skilled trades, arts, humanities, and sciences, along with dual enrollment, community partnerships, counseling, and a faculty and staff community of over 300 people and a budget approaching twenty million dollars.",
      "Dr. Nevill has more than 20 years of distinguished higher education experience. Before GateWay, he led academic affairs at Butler Community College in Kansas, where he guided the institution to become the first Adobe Creative Campus in the state. He was the founding Dean of Arts and Digital Media at Austin Community College, and earlier founded an internationally recognized Percussion Studies Program at the University of Texas at Brownsville as a tenured Associate Professor.",
      "Dr. Nevill's presence on the Zenith board is directly strategic. His leadership of GateWay's dual enrollment function creates a natural pathway toward the early college partnerships that are central to Zenith's model. He brings institutional credibility, deep knowledge of academic program design, and a track record of building innovative learning environments that serve diverse student populations.",
    ],
  },
  {
    name: "Luis Cordova, B.S.",
    focus: "Economic Analysis and Community Impact",
    photo: "/board/luis-cordova.jpg",
    paragraphs: [
      "Luis Cordova is Senior Vice President, COO, and co-founder of Rounds Consulting Group, where he leads economic, demographic, and fiscal impact analysis for public and private sector clients across Arizona and the broader region. His expertise spans economic forecasting, real estate market analysis, infrastructure investment, and community planning. He is a contributing panelist on the JPMorgan Chase Economic Outlook Center's Western Blue Chip Forecasts and a certified Arizona Economic Development Professional.",
      "Luis's work has directly shaped policy and investment in Arizona for over a decade, contributing to criminal justice reform, grant awards, affordable housing initiatives, workforce development programs, and the creation of tax credits. He is fluent in Spanish and leads his firm's efforts in Southern Arizona and Sonora, Mexico, with a focus on communities historically underserved by public investment. He also serves on the board of the Arizona Center for Autism.",
      "For Zenith, Luis brings an economic lens that strengthens the school's case to authorizers and grant funders: the ability to quantify community need, document fiscal impact, and connect Zenith's outcomes to the broader economic mobility of Maryvale families. His understanding of Arizona's public policy landscape is a resource few founding boards can claim.",
    ],
  },
  {
    name: "Veronica Sas, B.S.",
    focus: "Finance, Risk, and Audit",
    photo: "/board/veronica-sas.jpg",
    paragraphs: [
      "Veronica Sas is a seasoned finance executive with more than 25 years of experience helping organizations navigate growth, complexity, and change. She has served in senior financial leadership roles across nonprofits, clean energy companies, advanced manufacturing firms, and global technology businesses, earning a reputation for bringing clarity to financial strategy and building the internal controls that enable confident, long-term decision-making.",
      "Veronica has guided executive teams through audits, large-scale budgeting, system conversions, and risk management in operations spanning the United States, Saudi Arabia, Canada, China, and other regions. Her experience includes oversight of a one-billion-dollar commercial real estate bankruptcy involving 2,700 investors, as well as service on multiple finance and audit committees across sectors. She is also an entrepreneur and author.",
      "Veronica brings to Zenith the financial discipline and governance expertise that every new charter school must have to earn and sustain authorizer trust. Her ability to build transparent, accountable financial systems from the ground up is exactly what Zenith needs as it moves from application through its early years of operation.",
    ],
  },
  {
    name: "Emily Belt, B.A.",
    focus: "Operations, Community Access, and Regional Strategy",
    photo: "/board/emily-belt.jpg",
    paragraphs: [
      "Emily Belt is a senior operations executive, entrepreneur, and community builder with more than 17 years of continuous leadership experience across higher education, social services, and business ownership in Arizona. She currently serves as Regional Director of Operations at Grand Canyon University, overseeing admissions, retention, programming, and regional strategy for the state of Arizona. Over 14 years at GCU, she has been part of the university's growth into underserved Phoenix communities and has developed leaders at every level of her organization.",
      "Emily is also the co-founder and co-owner of Crown Heirs Hair Den, a full-service salon she built from the ground up in Phoenix. Earlier in her career, she served as Program Director at Childhelp's H.K. Cummings Community Center, leading community programming, partnering with school districts, and managing operations across multiple Valley sites. She holds a Bachelor of Arts in Psychology from Clarke University and is a proud Laveen resident and devoted mother.",
      "Emily's work has always centered on creating pathways of access and excellence for communities that deserve both. She brings to the Zenith board a practitioner's understanding of operations at scale, an entrepreneur's instinct for what it takes to build something lasting, and a personal commitment to the families in Phoenix who have been underserved for too long.",
    ],
  },
];

export default function OurBoardPage() {
  return (
    <>
      <Section
        eyebrow="Our Board"
        title="A founding board built for the work ahead."
        description="Nine community-rooted leaders bringing operational, legal, financial, instructional, and partnership expertise to Zenith&apos;s charter application and launch."
        bg="white"
      >
        <div className="mt-10 overflow-hidden rounded-3xl border border-ion bg-ion-soft">
          <Image
            src="/board-group.jpeg"
            alt="Zenith College and Career Prep founding board group photo"
            width={1600}
            height={1067}
            priority
            className="w-full h-auto object-cover"
          />
        </div>
      </Section>

      <Section eyebrow="Founder Spotlight" title={FOUNDER.name} bg="ion-soft">
        <div className="grid gap-10 md:grid-cols-[260px_1fr] items-start">
          <Image
            src={FOUNDER.photo}
            alt={`Portrait of ${FOUNDER.name}`}
            width={800}
            height={1000}
            className="w-full max-w-[220px] mx-auto md:mx-0 rounded-full aspect-[4/5] object-cover bg-midnight"
          />
          <div>
            <p className="text-lg md:text-xl font-semibold text-midnight">{FOUNDER.role}</p>
            <div className="mt-4 space-y-4">
              {FOUNDER.paragraphs.map((p, i) => (
                <p key={i} className="text-base md:text-lg leading-relaxed text-midnight">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Founding Board" title="Meet the founding board." bg="white">
        <div className="grid gap-8 md:grid-cols-2">
          {BOARD.map((m) => (
            <article
              key={m.name}
              className="rounded-2xl bg-ion-soft border border-ion p-6 md:p-8 flex flex-col"
            >
              <div className="flex items-start gap-4">
                {m.photo ? (
                  <Image
                    src={m.photo}
                    alt={`Portrait of ${m.name}`}
                    width={160}
                    height={160}
                    className="w-16 h-16 rounded-xl shrink-0 object-cover bg-midnight"
                  />
                ) : (
                  <BoardSilhouette className="w-16 h-16 rounded-xl shrink-0" />
                )}
                <div>
                  <p className="text-lg md:text-xl font-semibold text-midnight leading-snug">
                    {m.name}
                  </p>
                  <p className="mt-1 text-sm text-eventide font-medium">
                    Board Member &middot; {m.focus}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {m.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm md:text-base leading-relaxed text-midnight-75">
                    {p}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
