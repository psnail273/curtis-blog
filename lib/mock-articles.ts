import { Article } from '@/types/article';

export const mockArticles: Article[] = [
  {
    id: '1',
    slug: 'future-of-education-technology',
    title: 'The Future of Education Technology',
    excerpt:
      'Exploring how AI and digital tools are reshaping the classroom experience for students and educators alike. The transformation is happening faster than anyone anticipated.',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.`,
    author: 'Curtis Israel',
    publishedAt: '2026-01-28T10:00:00Z',
    category: 'Education',
    readTime: 5,
  },
  {
    id: '2',
    slug: 'modern-game-design-philosophy',
    title: 'Modern Game Design Philosophy',
    excerpt:
      'What makes a game truly memorable? Examining the principles that separate good games from great ones, and why player agency matters more than ever.',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla. Maecenas sed diam eget risus varius blandit sit amet non magna.

Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.

Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras mattis consectetur purus sit amet fermentum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.`,
    author: 'Curtis Israel',
    publishedAt: '2026-01-25T14:30:00Z',
    category: 'Gaming',
    readTime: 7,
  },
  {
    id: '3',
    slug: 'understanding-political-polarization',
    title: 'Understanding Political Polarization',
    excerpt:
      'A deep dive into the roots of political division and what research tells us about bridging the gap. Can we find common ground in an era of extremes?',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.

Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

Sed posuere consectetur est at lobortis. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Maecenas faucibus mollis interdum. Donec id elit non mi porta gravida at eget metus.

Vestibulum id ligula porta felis euismod semper. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna.`,
    author: 'Curtis Israel',
    publishedAt: '2026-01-22T09:15:00Z',
    category: 'Politics',
    readTime: 8,
  },
  {
    id: '4',
    slug: 'building-better-web-applications',
    title: 'Building Better Web Applications',
    excerpt:
      'From architecture decisions to deployment strategies, lessons learned from years of building production web applications that scale.',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit.

Etiam porta sem malesuada magna mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur. Donec ullamcorper nulla non metus auctor fringilla. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.

Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.

Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.`,
    author: 'Curtis Israel',
    publishedAt: '2026-01-18T16:45:00Z',
    category: 'Tech',
    readTime: 6,
  },
  {
    id: '5',
    slug: 'roguelikes-and-procedural-generation',
    title: 'Roguelikes and the Art of Procedural Generation',
    excerpt:
      'How procedural generation creates infinite replayability and why roguelikes have captured the hearts of millions of players worldwide.',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod.

Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.

Nullam quis risus eget urna mollis ornare vel eu leo. Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

Aenean lacinia bibendum nulla sed consectetur. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cras mattis consectetur purus sit amet fermentum.`,
    author: 'Curtis Israel',
    publishedAt: '2026-01-15T11:00:00Z',
    category: 'Gaming',
    readTime: 5,
  },
  {
    id: '6',
    slug: 'rethinking-homework-in-schools',
    title: 'Rethinking Homework in Modern Schools',
    excerpt:
      'Is homework helping or hurting students? Examining the evidence and exploring alternative approaches to reinforcing learning outside the classroom.',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed consectetur.

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nulla vitae elit libero, a pharetra augue. Cras mattis consectetur purus sit amet fermentum. Donec sed odio dui. Duis mollis, est non commodo luctus, nisi erat porttitor ligula.

Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.

Sed posuere consectetur est at lobortis. Maecenas faucibus mollis interdum. Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod.`,
    author: 'Curtis Israel',
    publishedAt: '2026-01-10T08:30:00Z',
    category: 'Education',
    readTime: 4,
  },
];
