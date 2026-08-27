import { Link } from "react-router-dom";
import { mockProfiles } from "../tests/mockProfiles";

const AllRatingsMockPage = () => {
    return (
        <div>
            <h2>Community Ratings (Mock)</h2>
            <div>
                {mockProfiles.map((profile) => (
                    <div key={profile.username}>
                        <h3>
                            <Link to={`/profile-mock/${profile.username}`}>{profile.username}</Link>
                        </h3>
                        <ul>
                            {profile.ratedReleases.map((release) => (
                                <li key={release.id}>
                                    {release.thumb && (
                                        <img src={release.thumb} alt={release.title} width={40} height={40} />
                                    )}
                                    {release.artist} — {release.title}{" "}
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span key={i}>{i < release.rating ? "★" : "☆"}</span>
                                    ))}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllRatingsMockPage;