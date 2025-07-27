import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TestimonialWithUser } from '@/lib/types/testimonial';

interface TestimonialSectionProps {
  testimonials: TestimonialWithUser[];
  userId: string;
}

export const TestimonialSection = ({ testimonials, userId }: TestimonialSectionProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const canAddTestimonial = user && user.id !== userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 border-r-4 border-b-4 border-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <Quote size={20} />
              Testimonials ({testimonials.length})
            </CardTitle>
            
            {canAddTestimonial && (
              <Button 
                size="sm"
                onClick={() => navigate('/testimonials/new', { 
                  state: { recipientId: userId } 
                })}
              >
                <Plus size={16} />
                Add Testimonial
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {testimonials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 space-y-4"
            >
              <p className="text-muted-foreground">
                No testimonials yet
              </p>
              {canAddTestimonial && (
                <Button 
                  onClick={() => navigate('/testimonials/new', { 
                    state: { recipientId: userId } 
                  })}
                >
                  <Plus size={16} />
                  Be the First to Leave a Testimonial
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border-2 border-foreground rounded-lg bg-card"
                >
                  <div className="flex gap-3">
                    <Quote size={20} className="text-muted-foreground mt-1 flex-shrink-0" />
                    
                    <div className="flex-1 space-y-3">
                      <p className="leading-relaxed">
                        {testimonial.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>From collaborator</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(testimonial.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};