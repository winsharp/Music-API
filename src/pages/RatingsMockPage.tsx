import { useParams } from "react-router-dom";
import { mockProfiles } from "../tests/mockProfiles";

const RatingsMockPage = () => {
    const { username } = useParams<{ username: string }>();
    const profile = mockProfiles.find((p) => p.username === username);

    if (!profile) return <p>No mock profile found for "{username}".</p>;

    return (
        <div>
            <h2>{profile.username}'s Ratings (Mock)</h2>
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
    );
};

export default RatingsMockPage;