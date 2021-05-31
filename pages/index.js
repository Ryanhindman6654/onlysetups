import { RepeatIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Container,
    Heading,
    Link,
    SimpleGrid,
    Skeleton,
    Text,
    useDisclosure
} from '@chakra-ui/react';
import { useState } from 'react';

import Card from '../components/Card';
import Header from '../components/Header';
import PreviewImage from '../components/PreviewImage';
import { PAGE_LIMIT, SUBREDDITS } from '../lib/constants';
import useRedditPosts, { transformPost } from '../lib/useRedditPosts';

export default function Home() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPost, setSelectedPost] = useState(null);
    const [filter, setFilter] = useState('hot');
    const [subreddits, setSubreddits] = useState(SUBREDDITS);

    const {
        posts,
        error,
        isLoadingInitialData,
        isLoadingMore,
        size,
        setSize,
        isReachingEnd
    } = useRedditPosts(subreddits, filter);

    if (error) {
        return (
            <Text p={4}>
                An error occurred. Please <Link href="/">reload</Link>.
            </Text>
        );
    }

    const withMediaOnly = (item) => {
        if (item.data.crosspost_parent) return false;

        if (
            (!item.data.is_self || (item.data.domain && item.data.domain === 'i.redd.it')) &&
            !item.data.media
        )
            return true;

        return false;
    };

    const transformedPosts = !isLoadingInitialData
        ? posts.filter(withMediaOnly).map((post) => transformPost(post))
        : [];

    const view = (post) => {
        setSelectedPost(post);
        onOpen();
    };

    return (
        <Box minHeight="100vh" display="flex" flexDir="column">
            <Header
                filter={filter}
                setFilter={setFilter}
                subreddits={subreddits}
                setSubreddits={setSubreddits}
            />
            <Container maxW="xl" mt="95px" flex={1}>
                <Box textAlign="center">
                    <Heading as="h1" size="4xl">
                        OnlySetups
                    </Heading>
                    <Text fontSize="lg" fontWeight="semibold" mt={2}>
                        Easily view workstations and gaming setups from{' '}
                        <Link href="https://reddit.com" isExternal>
                            reddit
                        </Link>
                    </Text>
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mt={6}>
                    {transformedPosts.map((post) => (
                        <Card key={post.id} post={post} onImageClick={view} />
                    ))}

                    {(isLoadingInitialData || isLoadingMore) &&
                        [...Array(PAGE_LIMIT).keys()].map((item) => (
                            <Skeleton borderRadius={['sm', null, 'md']} key={item} height="275px" />
                        ))}
                </SimpleGrid>

                {!isReachingEnd && (
                    <Box textAlign="center" mt={8}>
                        <Button
                            leftIcon={<RepeatIcon />}
                            onClick={() => setSize(size + 1)}
                            isLoading={isLoadingMore}>
                            Load More
                        </Button>
                    </Box>
                )}
            </Container>
            {selectedPost && <PreviewImage isOpen={isOpen} onClose={onClose} post={selectedPost} />}
            <Container as="footer" maxW="xl" textAlign="center" py={10}>
                <Text>
                    Made with{' '}
                    <span role="img" aria-label="heart emoji">
                        ❤️
                    </span>{' '}
                    by{' '}
                    <Link href="http://ryansprogramming.com/" isExternal>
                        Ryan
                    </Link>
                </Text>
            </Container>
        </Box>
    );
}
