import { FolderPlus, GitBranchPlus, UserPlus, GitMerge, Rocket, Send } from 'lucide-react';

const Features = [
  {
    icon: FolderPlus,
    title: "rune init <project-idea>",
    description: "Initialize a new project. Plant the flag for your idea, from a grand thesis to a really cool to-do list app."
  },
  {
    icon: GitBranchPlus,
    title: "rune branch <skill-needed>",
    description: "Create a 'Help Wanted' branch for a specific role. Find someone to merge their talent into your project."
  },
  {
    icon: UserPlus,
    title: "rune add <username>",
    description: "Stage a potential collaborator by sending a team invite. This 'file' has opinions, so a merge requires their approval."
  },
  {
    icon: GitMerge,
    title: "rune merge <teammate-username>",
    description: "Officially merge a new teammate into your project. Conflicts are now resolved over pizza topping choices."
  },
  {
    icon: Rocket,
    title: 'rune commit -m "Showcase"',
    description: "Commit your project to the public gallery. Your commit message is your elevator pitch—make it count."
  },
  {
    icon: Send,
    title: "rune push --origin main-feed",
    description: "Push your project or request to the main discovery feed. Deploy your work from your brain to public opinion."
  }
];

export default Features;