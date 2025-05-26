Example project of a Movie Web App connected to MovieDB API.

Next js 14 (React 18).

Includes client pages and ISG page.

To start:

npm install
npm run dev

For API to work, you need to generate your own API key with the MovieDB
and fill in NEXT_PUBLIC_TMDB_API_KEY after creating .env.local 

Runs on localhost:3000

To test:

npm run test (playwright)
npm run jest 

To lint:

npm run lint
npm run tsc


Thoughts:

Could have used MovieDB watchlist and create reviews. 
But felt like app needs to have a meaning for people to sign up.
Didn't feel right to simply link login to theirs.

Could have used new Next JS (stable since May 2025) with React 19 (stable as of Dec 2024).
But used Next JS 14 and React 18, as I'm more familiar with them, and likely would have more documentation
, library support and stackoverflow help in case of bugs.

Had one page (Latest), or the Main Page, as ISG (Incremental Static Generation).
In retrospect, could have made them all like that.
The endpoints aren't as updated, like a live dashboard, so serving static content
before user interaction makes sense to decrease API requests from clients.

Could have spent more time on unit testing, tests are basic, but spent more time on design,
the design is from scratch (aside from AI generation of images).

Didn't implement database, but mock json files that act like one. But feel I could have used
MongoDB, as there's not much relational mapping.

Things I wanted to do but ran out of time: 

1- Throttling pagination, although it runs pretty fast.
2- Coverflow toggle mode (like in old Mac OS, but Vertical like CD cases, or like Gnome 2 Linux Effects for GUI). But doesn't play well with Next JS, the libraries I tried,
and heavy on performance. Needs one that is minimal and fast.
3- More playwright tests as they're very cool.
4- An upcoming section, but the API's upcoming doesn't show actualy upcoming movies, but now playing.
And throwing in 2026+ release dates, seems to likely render movies that are misdated.


