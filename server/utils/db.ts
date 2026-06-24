import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db.json");

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: string;
  authorId?: string;
  title: string;
  content: string;
  type: "general" | "analysis";
  category: "news" | "tactics" | "transfers" | "general";
  votes: number;
  votedUserIds?: string[]; // track who voted
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: "international" | "match_result" | "upcoming";
  category: string;
  imageUrl?: string;
  date: string;
  
  // Optional match details
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
  kickOff?: string;
  venue?: string;
}

export interface RugbyPlayer {
  id: string;
  name: string;
  position: string;
  rating: number;
  club: string;
  country: string;
  isCustom: boolean;
  userId?: string; // If custom player
}

export interface TacticBoard {
  id: string;
  name: string;
  formation: "15-union" | "7-sevens" | "custom";
  playersOnField: Array<{
    id: string;
    name: string;
    position: string;
    roleName: string; // tactical position on field (e.g., Fly-half, Prop, Lock)
    x: number; // percentage width 0-100
    y: number; // percentage height 0-100
  }>;
  userId: string;
  username: string;
  notes?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  posts: Post[];
  news: NewsArticle[];
  players: RugbyPlayer[];
  tactics: TacticBoard[];
}

// Initial/default database values
const DEFAULT_DB: DatabaseSchema = {
  users: [],
  posts: [
    {
      id: "post-1",
      author: "RugbyTactician99",
      title: "Is France's narrow 5-3 bench split superior to the Springboks' 7-1 'Bomb Squad'?",
      content: "With the rise of high-intensity, physical test matches, how teams organize their benches has become as critical as the starting XV. The Springboks popularized the 7-1 split, offering unparalleled forward pack rejuvenation but leaving themselves highly exposed to backline injuries. France, under Galthié, has perfected a flexible 5-3 split with multi-position utility backs like Ramos and Barré. Let's analyze the pros and cons of both styles under the modern laws of rugby.",
      type: "analysis",
      category: "tactics",
      votes: 42,
      votedUserIds: [],
      comments: [
        {
          id: "c1",
          author: "BokFanatic",
          content: "The 7-1 only works if you have versatile forwards who can handle the pace, and backs who are resilient. If a fly-half goes down, the 7-1 becomes a massive liability. Still, nothing beats seeing 7 fresh monstrous forwards run on at 50 minutes!",
          createdAt: "2026-06-23T18:30:00Z"
        },
        {
          id: "c2",
          author: "DublinPivot",
          content: "I think Ireland's 6-2 split is the sweet spot. Gives you locking and back-row depth, plus a scrum-half cover and a utility back. 7-1 is pure brutality but high risk.",
          createdAt: "2026-06-23T19:15:00Z"
        }
      ],
      createdAt: "2026-06-23T14:22:00Z"
    },
    {
      id: "post-2",
      author: "SixNationsWatcher",
      title: "Antoine Dupont's switch to Rugby Sevens: Ultimate tactical masterclass?",
      content: "Watching Antoine Dupont seamlessly transition from the 15s standard to Olympic Rugby Sevens has been an absolute joy. His positional awareness, incredible low-gravity strength, and crisp offloads have redefined how sevens is played. It raises a huge question: will more elite 15s players try to cross over, or is Dupont a once-in-a-generation outlier?",
      type: "analysis",
      category: "news",
      votes: 56,
      votedUserIds: [],
      comments: [
        {
          id: "c3",
          author: "AllBlacksCore",
          content: "Dupont is just a freak of nature. Most 15s players do not have the pure aerobic capacity to run standard Sevens channels for 14 minutes straight. His engine is unbelievable.",
          createdAt: "2026-06-24T02:10:00Z"
        }
      ],
      createdAt: "2026-06-23T22:10:00Z"
    },
    {
      id: "post-3",
      author: "OvalOffice",
      title: "Rugby Championship 2026 Predictions: Can Wallabies bounce back under Schmidt?",
      content: "After a rebuilding phase, the Wallabies are looking more organized, but facing the All Blacks and the current World Champion Springboks back-to-back remains the toughest test in sports. What are your tactical predictions for Australia's breakdown efficiency?",
      type: "general",
      category: "news",
      votes: 19,
      votedUserIds: [],
      comments: [],
      createdAt: "2026-06-24T05:40:00Z"
    }
  ],
  news: [
    {
      id: "news-1",
      title: "Ireland Clinches Six Nations Title in Dramatic Dublin Finale",
      content: "In a breathtaking display of clinical rugby, Ireland successfully defended their Six Nations title at the Aviva Stadium, holding off a fierce challenge from a resurgent French squad. A late try by Dan Sheehan secured the victory, sealing a remarkable campaign marked by tactical kicking precision and robust defense at the breakdown.",
      summary: "Ireland defeats France to win the Six Nations title at the Aviva Stadium in a tactical masterclass.",
      type: "international",
      category: "Six Nations",
      imageUrl: "",
      date: "2026-06-22T17:00:00Z"
    },
    {
      id: "news-2",
      title: "All Blacks Announce Squad for Upcoming Southern Hemisphere Tour",
      content: "The New Zealand Rugby Union has officially unveiled the 36-man squad for the upcoming Rugby Championship. Head coach Scott Robertson has opted for a blend of experienced veterans and four uncapped young players, aiming to revitalize the team's attack. The squad features a heavily competitive loose-forward group.",
      summary: "Scott Robertson names 36-man All Blacks squad, introducing exciting young talent into the mix.",
      type: "international",
      category: "Team News",
      imageUrl: "",
      date: "2026-06-23T09:30:00Z"
    },
    {
      id: "news-3",
      title: "Match Result: South Africa vs Ireland (Cape Town)",
      content: "An absolute titan clash ended in Cape Town as the world champions South Africa defeated Ireland in a physical encounter. Man of the match Pieter-Steph du Toit made 24 tackles and scored a pivotal try off a charge-down. Ireland's late comeback fell short under intense Springbok scrum pressure.",
      summary: "The Springboks hold off a late Ireland charge to secure a thrilling victory in Cape Town.",
      type: "match_result",
      category: "Test Match",
      date: "2026-06-20T19:00:00Z",
      teamA: "South Africa",
      teamB: "Ireland",
      scoreA: 27,
      scoreB: 20,
      venue: "DHL Stadium, Cape Town"
    },
    {
      id: "news-4",
      title: "Match Result: New Zealand vs England (Auckland)",
      content: "The All Blacks successfully defended Eden Park's long-standing unbeaten record, overcoming England in a high-stakes second test. Damian McKenzie's precise tactical kicking and a late try from Caleb Clarke clinched the victory, despite England's exceptional maul defense.",
      summary: "The All Blacks maintain their Eden Park fortress, edging England in a thriller.",
      type: "match_result",
      category: "Test Match",
      date: "2026-06-13T08:00:00Z",
      teamA: "New Zealand",
      teamB: "England",
      scoreA: 24,
      scoreB: 17,
      venue: "Eden Park, Auckland"
    },
    {
      id: "news-5",
      title: "Upcoming: New Zealand vs South Africa (Johannesburg)",
      content: "The ultimate rivalry in rugby union resumes at the legendary Ellis Park. Both teams are locked at the top of the Rugby Championship standings. Tactical setups will center on South Africa's high-ball contestables against New Zealand's counter-attacking fluidity. Kick-off is scheduled for Saturday night.",
      summary: "All Blacks face the Springboks at Ellis Park in a Rugby Championship decider.",
      type: "upcoming",
      category: "Rugby Championship",
      date: "2026-06-27T15:00:00Z",
      teamA: "South Africa",
      teamB: "New Zealand",
      kickOff: "Saturday, June 27 - 17:00 Local",
      venue: "Ellis Park, Johannesburg"
    },
    {
      id: "news-6",
      title: "Upcoming: Australia vs Argentina (Sydney)",
      content: "The Wallabies look to capture key tournament points as they host Los Pumas in Sydney. Australia's head coach has focused heavily on reducing turnovers, while Argentina plans to deploy their dangerous, expansive backline play.",
      summary: "Wallabies look to secure vital points against Los Pumas in an expansive Sydney showdown.",
      type: "upcoming",
      category: "Rugby Championship",
      date: "2026-07-04T10:00:00Z",
      teamA: "Australia",
      teamB: "Argentina",
      kickOff: "Saturday, July 4 - 20:00 Local",
      venue: "Accor Stadium, Sydney"
    }
  ],
  players: [
    // World Class pre-populated players
    { id: "p1", name: "Antoine Dupont", position: "Scrum-half", rating: 98, club: "Toulouse", country: "France", isCustom: false },
    { id: "p2", name: "Ardie Savea", position: "No. 8", rating: 96, club: "Kobe Steelers", country: "New Zealand", isCustom: false },
    { id: "p3", name: "Pieter-Steph du Toit", position: "Flanker", rating: 95, club: "Toyota Verblitz", country: "South Africa", isCustom: false },
    { id: "p4", name: "Cheslin Kolbe", position: "Winger", rating: 94, club: "Suntory Sungoliath", country: "South Africa", isCustom: false },
    { id: "p5", name: "Eben Etzebeth", position: "Lock", rating: 96, club: "Sharks", country: "South Africa", isCustom: false },
    { id: "p6", name: "Hugo Keenan", position: "Full-back", rating: 92, club: "Leinster", country: "Ireland", isCustom: false },
    { id: "p7", name: "Bundee Aki", position: "Centre", rating: 93, club: "Connacht", country: "Ireland", isCustom: false },
    { id: "p8", name: "Caelan Doris", position: "No. 8", rating: 94, club: "Leinster", country: "Ireland", isCustom: false },
    { id: "p9", name: "Dan Sheehan", position: "Hooker", rating: 93, club: "Leinster", country: "Ireland", isCustom: false },
    { id: "p10", name: "Maro Itoje", position: "Lock", rating: 92, club: "Saracens", country: "England", isCustom: false },
    { id: "p11", name: "Marcus Smith", position: "Fly-half", rating: 91, club: "Harlequins", country: "England", isCustom: false },
    { id: "p12", name: "Ben Earl", position: "No. 8", rating: 93, club: "Saracens", country: "England", isCustom: false },
    { id: "p13", name: "Gregory Alldritt", position: "No. 8", rating: 94, club: "La Rochelle", country: "France", isCustom: false },
    { id: "p14", name: "Damian McKenzie", position: "Fly-half", rating: 92, club: "Chiefs", country: "New Zealand", isCustom: false },
    { id: "p15", name: "Will Jordan", position: "Winger", rating: 93, club: "Crusaders", country: "New Zealand", isCustom: false },
    { id: "p16", name: "Ox Nche", position: "Prop", rating: 94, club: "Sharks", country: "South Africa", isCustom: false },
    { id: "p17", name: "Tadhg Furlong", position: "Prop", rating: 91, club: "Leinster", country: "Ireland", isCustom: false },
    { id: "p18", name: "Frans Malherbe", position: "Prop", rating: 93, club: "Stormers", country: "South Africa", isCustom: false }
  ],
  tactics: []
};

let dbCache: DatabaseSchema | null = null;

/**
 * Initialize and load database
 */
export function getDB(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create directories if missing
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
      return dbCache!;
    }

    const data = fs.readFileSync(DB_PATH, "utf8");
    dbCache = JSON.parse(data);
    
    // Safety check: ensure all core arrays exist
    if (!dbCache!.users) dbCache!.users = [];
    if (!dbCache!.posts) dbCache!.posts = [];
    if (!dbCache!.news) dbCache!.news = [];
    if (!dbCache!.players) dbCache!.players = [];
    if (!dbCache!.tactics) dbCache!.tactics = [];

    return dbCache!;
  } catch (error) {
    console.error("Failed to read database file, using default in-memory fallback", error);
    dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
    return dbCache!;
  }
}

/**
 * Persist database to disk
 */
export function saveDB(data: DatabaseSchema): void {
  dbCache = data;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write to database file", error);
  }
}
