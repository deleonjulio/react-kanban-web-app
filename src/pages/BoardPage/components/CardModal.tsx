import React, { useEffect, useState } from "react";
import { Divider, Modal, Title, Paper, SimpleGrid, Text, Grid, Button, Flex, TextInput, Select, Avatar, Group } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import dayjs from "dayjs";
import { SelectedCard, UpdateCardPayload } from "../../../types";
import { IconTrash, IconEdit } from "@tabler/icons-react";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CardActivity, PriorityBadge } from "../components";
import { PRIORITY_OPTIONS } from "../../../config";

export const CardModal = ({
    opened,
    close,
    selectedCard,
    boardName,
    initDeleteCard,
    handleUpdateCard,
    updateCardIsPending
}: {
    opened: boolean; 
    close: () => void; 
    selectedCard: SelectedCard | null;
    boardName: string;
    initDeleteCard: () => void;
    handleUpdateCard: ({payload, onSuccess}: { payload: UpdateCardPayload; onSuccess: () => void }) => void;
    updateCardIsPending: boolean;
}) => {
    const card: SelectedCard | null = selectedCard;
    const [editMode, setEditMode] = useState(false);
    const [editableSelectedCard, setEditableSelectedCard] = useState<SelectedCard | null>(null)

    const handleUpdateCardState = (stateName: string, value: any) => {
        if(stateName === 'title') {
            setEditableSelectedCard((prev) => {
                if(!prev) return null;
                return {
                    ...prev,
                    title: value
                }
            })
        } else if(stateName === 'content') {
            setEditableSelectedCard((prev) => {
                if(!prev) return null;
                return {
                    ...prev,
                    content: value?.content,
                    formatted_content: value?.formatted_content
                }
            })
        } else if(stateName === 'priority') {
            setEditableSelectedCard((prev) => {
                if(!prev) return null;
                return {
                    ...prev,
                    priority: value
                }
            })
        } else if(stateName === 'due_date') {
            setEditableSelectedCard((prev) => {
                if(!prev) return null;
                return {
                    ...prev,
                    due_date: value ? dayjs(value) : null
                }
            })
        } 
    }
    
    const handleContentUpdate = ({editor}: {editor: Editor}) => {
        const content = editor.getText();
        const formatted_content = editor.getHTML();
        handleUpdateCardState('content', {content, formatted_content})
    }

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        onUpdate: handleContentUpdate,
    });

    const editorView = useEditor({
        editable: false,
        extensions: [StarterKit],
        content: '',
        editorProps: {
            attributes: {
              class: 'ProseMirrorView',
            },
          },
    });

    const resetCardModal = () => {
        close()
        setEditMode(false)
        setEditableSelectedCard(null)
    }

    const initUpdateCard = () => {
        const payload: UpdateCardPayload = {
            _id: editableSelectedCard?._id,
            column_id: editableSelectedCard?.column_id,
            title: editableSelectedCard?.title ?? '',
            content: editableSelectedCard?.content ?? '',
            formatted_content: editableSelectedCard?.formatted_content ?? '',
            priority: editableSelectedCard?.priority ?? null,
            due_date: editableSelectedCard?.due_date ? editableSelectedCard?.due_date : null,
        }
        handleUpdateCard({payload, onSuccess: () => setEditMode(false)})
    }

    useEffect(() => {
        if(editMode) {
            if(!editor) {
                return;
            }
            setEditableSelectedCard(card);
            editor.commands.setContent(card?.formatted_content ?? "", false);
        }
    }, [editMode])

    useEffect(() => {
        if(!editMode) {
            if(!editorView) {
                return;
            }
            editorView.commands.setContent(card?.formatted_content ?? "", false);
        }
    }, [editMode])

    useEffect(() => {
        if(opened) {
            if(!editorView) {
                return;
            }
            editorView.commands.setContent(card?.formatted_content ?? "", false);
        }
    }, [opened])

    return (
        <Modal classNames={{ content: "card-modal" }} title={<Text size="sm" fw={700}>{boardName}</Text>} closeOnEscape={false} closeOnClickOutside={false} opened={opened} onClose={resetCardModal} size="64rem">
            <SimpleGrid cols={1} spacing="xs" verticalSpacing="xs" pt="sm">
                {editMode ? (
                    <React.Fragment>
                      <Grid>
                          <Grid.Col span={{ xs: 12, sm:8, md: 9, lg: 9 }} />
                          <Grid.Col span={{ xs: 12, sm:4, md: 3, lg: 3 }}>
                              <Flex justify="flex-end" align="center" gap="md" h="100%">
                                  <Button color="black" variant="white" onClick={() => setEditMode(false)} disabled={updateCardIsPending}>
                                      Cancel
                                  </Button>
                                  <Button variant="white" onClick={initUpdateCard} disabled={updateCardIsPending} loading={updateCardIsPending}>
                                      Save
                                  </Button>
                              </Flex>
                          </Grid.Col>
                      </Grid>
                      <Paper p="md">
                        <TextInput value={editableSelectedCard?.title ?? ''} onChange={(e) => handleUpdateCardState('title', e.target.value)} />
                      </Paper>
                      <Paper shadow="xs" p="md">
                        <EditorContent key={editableSelectedCard?._id} editor={editor} />
                        <Divider my="md" variant="dotted" />
                        <Grid>
                            <Grid.Col span={{ xs: 12, sm:12, md: 6, lg: 6 }}>
                                <Grid align="center">
                                    <Grid.Col span={{ base: 4 }}>
                                        <Text fw={700} size="sm">Assignee</Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 6 }}>
                                        <Select />
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                            <Grid.Col span={{ xs: 12, sm:12, md: 6, lg: 6 }}>
                                <Grid align="center">
                                    <Grid.Col span={{ base: 4 }}>
                                        <Text fw={700} size="sm">Priority</Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 6 }}>
                                        <Select 
                                            clearable
                                            value={editableSelectedCard?.priority}
                                            onChange={(e) => handleUpdateCardState('priority', e)}
                                            data={PRIORITY_OPTIONS}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                            <Grid.Col span={{ xs: 12, sm:12, md: 6, lg: 6 }}>
                                <Grid align="center">
                                    <Grid.Col span={{ base: 4 }}>
                                        <Text fw={700} size="sm">Due Date</Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 6 }}>
                                        <DatePickerInput
                                            valueFormat="MMM. DD, YYYY"
                                            clearable
                                            onChange={(e) => handleUpdateCardState('due_date', e)}
                                            value={editableSelectedCard?.due_date ? new Date(editableSelectedCard?.due_date) : null}
                                        />
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        </Grid>
                      </Paper>
                  </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Grid>
                            <Grid.Col span={{ xs: 12, sm:8, md: 9, lg: 9 }}><Title order={4}> {selectedCard?.title}</Title></Grid.Col>
                            <Grid.Col span={{ xs: 12, sm:4, md: 3, lg: 3 }}>
                                <Flex justify="flex-end" align="center" gap="md" h="100%">
                                    <Button color="black" leftSection={<IconEdit size={14} />} variant="white" onClick={() => setEditMode(true)}>
                                        Edit
                                    </Button>
                                    <Button color="red" leftSection={<IconTrash size={14} />} variant="white" onClick={initDeleteCard}>
                                        Delete
                                    </Button>
                                </Flex>
                            </Grid.Col>
                        </Grid>
                        <Paper shadow="xs" p="md">
                            <Group gap="xs">
                                <Avatar name={card?.created_by?.name } color="initials" />
                                <div>
                                    <Text size="sm" fw={700}>{card?.created_by?.name ?? '-'}</Text>
                                    <Text size="xs" c="gray.7">Created {dayjs(card?.date_created).format('MMM. DD, YYYY HH:mm:ss')}</Text>
                                </div>
                            </Group>
                            <Divider my="md" variant="dotted" />
                            {!editorView?.isEmpty && <EditorContent key={editableSelectedCard?._id} editor={editorView} />}
                            {!editorView?.isEmpty && <Divider my="md" variant="dotted" />}
                            <Grid>
                                <Grid.Col span={{ xs: 12, sm:12, md: 6, lg: 6 }}>
                                    <Grid>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={700} size="sm">Assignee</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="sm">{'-'}</Text> 
                                        </Grid.Col>
                                    </Grid>
                                </Grid.Col>
                                <Grid.Col span={{ xs: 12, sm:12, md: 6, lg: 6 }}>
                                    <Grid>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={700} size="sm">Priority</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            {card?.priority ? <PriorityBadge priority={card?.priority} /> : '-'}
                                        </Grid.Col>
                                    </Grid>
                                </Grid.Col>
                                <Grid.Col span={{ xs: 12, sm:12, md: 6, lg: 6 }}>
                                    <Grid>
                                        <Grid.Col span={{ base: 4 }}>
                                            <Text fw={700} size="sm">Due Date</Text>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 6 }}>
                                            <Text size="sm">{card?.due_date ? dayjs(card?.due_date).format('MMM. DD, YYYY') : "-"}</Text>
                                        </Grid.Col>
                                    </Grid>
                                </Grid.Col>
                            </Grid>
                        </Paper>
                        <CardActivity cardId={selectedCard?._id} />
                    </React.Fragment>
                )}
            </SimpleGrid>
        </Modal>
    )
}
