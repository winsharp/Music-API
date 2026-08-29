import { Placeholder } from "react-bootstrap";
import CardGridSkeleton from "./CardGridSkeleton";

/**
 * Loading placeholder mirroring the real ProfilePage layout:
 * avatar/name/stats header, then the Recently Rated, Collection and
 * Wantlist sections.
 */
const ProfilePageSkeleton = () => (
    <>
        <section className="text-center mb-4">
            <Placeholder
                as="div"
                animation="glow"
                className="mb-2 mx-auto rounded-circle"
                style={{ width: 96, height: 96 }}
            >
                <Placeholder className="w-100 h-100 rounded-circle" />
            </Placeholder>
            <Placeholder as="h1" animation="glow">
                <Placeholder xs={3} />
            </Placeholder>
            <Placeholder as="p" animation="glow">
                <Placeholder xs={2} />
            </Placeholder>
            <Placeholder as="p" animation="glow">
                <Placeholder xs={4} />
            </Placeholder>
            <Placeholder.Button variant="primary" xs={3} />
        </section>

        <section className="mb-4">
            <h2>Recently Rated</h2>
            <CardGridSkeleton count={5} />
        </section>

        <section className="mb-4">
            <h2>Collection</h2>
            <CardGridSkeleton count={10} />
        </section>

        <section>
            <h2>Wantlist</h2>
            <CardGridSkeleton count={5} />
        </section>
    </>
);

export default ProfilePageSkeleton;
