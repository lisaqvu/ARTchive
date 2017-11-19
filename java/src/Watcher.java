import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.io.IOException;
import org.apache.commons.exec.CommandLine;
import org.apache.commons.exec.DefaultExecutor;
import org.apache.commons.exec.ExecuteException;
// Code copied https://stackoverflow.com/posts/27737069/revisions

public class Watcher extends Thread {
  private final File file;
  private AtomicBoolean stop = new AtomicBoolean(false);

  public Watcher(File file) {
    this.file = file;
  }

  private boolean isStopped() {
    return stop.get();
  }

  public static void runScript() throws IOException {
    try {
      ProcessBuilder pb = new ProcessBuilder("test2.sh");
      pb.start();
    } catch (IOException e) {
      System.out.println(e.getMessage());
    }
  }

  private void doOnChange() throws Exception {
    TakeScreenshot.run();
    runScript();
  }

  @Override
  public void run() {
    try (WatchService watcher = FileSystems.getDefault().newWatchService()) {
      Path path = file.toPath().getParent();
      long lastModified = file.lastModified();
      path.register(watcher, StandardWatchEventKinds.ENTRY_MODIFY);
      while (!isStopped()) {
        WatchKey key;
        try {
          key = watcher.poll(25, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
          return;
        }
        if (key == null) {
          Thread.yield();
          continue;
        }

        Thread.sleep(500);
        for (WatchEvent<?> event : key.pollEvents()) {
          WatchEvent.Kind<?> kind = event.kind();

          @SuppressWarnings("unchecked")
          WatchEvent<Path> ev = (WatchEvent<Path>) event;
          Path filename = ev.context();

          if (kind == StandardWatchEventKinds.OVERFLOW) {
            Thread.yield();
            continue;
          } else if (kind == java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY
              && filename.toString().equals(file.getName())
              && file.lastModified() - lastModified > 1000) {
            doOnChange();
            lastModified = file.lastModified();
          }
          boolean valid = key.reset();
          if (!valid) {
            break;
          }
        }
        Thread.yield();
      }
    } catch (Throwable e) {
      System.out.println("Error");
    }
  }
}
