import java.awt.AWTException;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.imageio.ImageIO;

/*
 * Program copied and modified from
 * http://www.javatechblog.com/java/how-to-take-screenshot-programmatically-in-java/
 */
public class TakeScreenshot {

  public static void run(){
    try {
      Robot robot = new Robot();
      String fileName = "E:\\" + timestamp() + ".png";

      Rectangle screenRect = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
      BufferedImage screenFullImage = robot.createScreenCapture(screenRect);
      ImageIO.write(screenFullImage, "png", new File(fileName));

      System.out.println("Success!");

    } catch (AWTException | IOException ex) {
      System.err.println(ex);
    }
  }

  private static String timestamp() {
    return new SimpleDateFormat("yyyyMMdd HH-mm-ss").format(new Date());
  }

}
